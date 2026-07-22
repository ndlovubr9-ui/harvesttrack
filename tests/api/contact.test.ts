import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();
const mockCreate = vi.fn();
const mockFindMany = vi.fn();
const mockTransaction = vi.fn();
const mockUserUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUserUpdate(...args),
    },
    contact: {
      create: (...args: unknown[]) => mockCreate(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
    activity: { create: vi.fn() },
    $transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

vi.mock("@/lib/verifyAuth", () => ({
  verifyRequest: vi.fn(),
}));

import { POST, GET } from "@/app/api/contact/route";
import { verifyRequest } from "@/lib/verifyAuth";

describe("POST /api/contact", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects requests with no valid auth token", async () => {
    vi.mocked(verifyRequest).mockResolvedValue(null);

    const req = new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({ name: "Jane" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("rejects contact creation for a user with no church yet", async () => {
    vi.mocked(verifyRequest).mockResolvedValue("uid123");
    mockFindUnique.mockResolvedValue({ id: "u1", churchId: null });

    const req = new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({ name: "Jane", age: 20, phone: "123" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("creates a contact scoped to the user's own church and awards points", async () => {
    vi.mocked(verifyRequest).mockResolvedValue("uid123");
    mockFindUnique.mockResolvedValue({ id: "u1", churchId: "church1" });
    mockCreate.mockResolvedValue({ id: "c1", name: "Jane", churchId: "church1" });
    mockTransaction.mockResolvedValue([{}, {}]);
    mockUserUpdate.mockResolvedValue({
  id: "u1",
  points: 5,
});

    const req = new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "Jane",
        age: 20,
        phone: "123",
        gender: "F",
        location: "Here",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          church: { connect: { id: "church1" } },
          addedBy: { connect: { id: "u1" } },
        }),
      })
    );
    expect(mockTransaction).toHaveBeenCalled();
  });
});

describe("GET /api/contact (church scoping)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects unauthenticated requests", async () => {
    vi.mocked(verifyRequest).mockResolvedValue(null);
    const req = new Request("http://localhost/api/contact");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("only queries contacts belonging to the requester's own church", async () => {
    vi.mocked(verifyRequest).mockResolvedValue("uid123");
    mockFindUnique.mockResolvedValue({ id: "u1", churchId: "church1" });
    mockFindMany.mockResolvedValue([]);

    const req = new Request("http://localhost/api/contact");
    await GET(req);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ churchId: "church1", deletedAt: null }),
      })
    );
  });

  it("returns an empty list for a churchless user instead of erroring", async () => {
    vi.mocked(verifyRequest).mockResolvedValue("uid123");
    mockFindUnique.mockResolvedValue({ id: "u1", churchId: null });

    const req = new Request("http://localhost/api/contact");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([]);
    expect(mockFindMany).not.toHaveBeenCalled();
  });
});
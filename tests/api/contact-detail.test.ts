import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUserFindUnique = vi.fn();
const mockContactFindUnique = vi.fn();
const mockContactUpdate = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: (...args: unknown[]) => mockUserFindUnique(...args) },
    contact: {
      findUnique: (...args: unknown[]) => mockContactFindUnique(...args),
      update: (...args: unknown[]) => mockContactUpdate(...args),
    },
    activity: { create: vi.fn() },
    $transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

vi.mock("@/lib/verifyAuth", () => ({
  verifyRequest: vi.fn(),
}));

import { PATCH, DELETE } from "@/app/api/contact/[id]/route";
import { verifyRequest } from "@/lib/verifyAuth";

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("PATCH /api/contact/[id] (church access control)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("blocks updating a contact that belongs to a different church", async () => {
    vi.mocked(verifyRequest).mockResolvedValue("uid123");
    mockUserFindUnique.mockResolvedValue({ id: "u1", churchId: "church1" });
    mockContactFindUnique.mockResolvedValue({
      id: "c1",
      churchId: "church2",
      status: "New Contact",
    });

    const req = new Request("http://localhost/api/contact/c1", {
      method: "PATCH",
      body: JSON.stringify({ status: "Studying" }),
    });

    const res = await PATCH(req, makeParams("c1"));
    expect(res.status).toBe(403);
    expect(mockContactUpdate).not.toHaveBeenCalled();
  });

  it("allows updating a contact within the same church and awards points on baptism prep", async () => {
    vi.mocked(verifyRequest).mockResolvedValue("uid123");
    mockUserFindUnique.mockResolvedValue({ id: "u1", churchId: "church1" });
    mockContactFindUnique.mockResolvedValue({
      id: "c1",
      churchId: "church1",
      status: "Studying",
    });
    mockContactUpdate.mockResolvedValue({ id: "c1", status: "Preparing for Baptism" });
    mockTransaction.mockResolvedValue([{}, {}]);

    const req = new Request("http://localhost/api/contact/c1", {
      method: "PATCH",
      body: JSON.stringify({ status: "Preparing for Baptism" }),
    });

    const res = await PATCH(req, makeParams("c1"));
    expect(res.status).toBe(200);
    expect(mockTransaction).toHaveBeenCalled();
  });

  it("rejects an invalid status value", async () => {
    vi.mocked(verifyRequest).mockResolvedValue("uid123");

    const req = new Request("http://localhost/api/contact/c1", {
      method: "PATCH",
      body: JSON.stringify({ status: "Not A Real Status" }),
    });

    const res = await PATCH(req, makeParams("c1"));
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/contact/[id] (admin-only, soft delete)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("blocks non-admins from deleting a contact", async () => {
    vi.mocked(verifyRequest).mockResolvedValue("uid123");
    mockUserFindUnique.mockResolvedValue({ id: "u1", churchId: "church1", role: "member" });

    const req = new Request("http://localhost/api/contact/c1", { method: "DELETE" });
    const res = await DELETE(req, makeParams("c1"));

    expect(res.status).toBe(403);
    expect(mockContactUpdate).not.toHaveBeenCalled();
  });

  it("allows an admin to soft-delete a contact in their own church", async () => {
    vi.mocked(verifyRequest).mockResolvedValue("uid123");
    mockUserFindUnique.mockResolvedValue({ id: "u1", churchId: "church1", role: "admin" });
    mockContactFindUnique.mockResolvedValue({ id: "c1", churchId: "church1", deletedAt: null });
    mockContactUpdate.mockResolvedValue({ id: "c1", deletedAt: new Date() });

    const req = new Request("http://localhost/api/contact/c1", { method: "DELETE" });
    const res = await DELETE(req, makeParams("c1"));

    expect(res.status).toBe(200);
    expect(mockContactUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "c1" } })
    );
  });
});
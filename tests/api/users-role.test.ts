import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUserFindUnique = vi.fn();
const mockUserUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      update: (...args: unknown[]) => mockUserUpdate(...args),
    },
  },
}));

vi.mock("@/lib/verifyAuth", () => ({
  verifyRequest: vi.fn(),
}));

import { PATCH } from "@/app/api/users/[id]/role/route";
import { verifyRequest } from "@/lib/verifyAuth";

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("PATCH /api/users/[id]/role", () => {
  beforeEach(() => vi.clearAllMocks());

  it("blocks a non-admin from changing anyone's role", async () => {
    vi.mocked(verifyRequest).mockResolvedValue("uid123");
    mockUserFindUnique.mockResolvedValueOnce({ id: "u1", role: "member", churchId: "church1" });

    const req = new Request("http://localhost/api/users/u2/role", {
      method: "PATCH",
      body: JSON.stringify({ role: "admin" }),
    });

    const res = await PATCH(req, makeParams("u2"));
    expect(res.status).toBe(403);
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it("blocks an admin from demoting themself", async () => {
    vi.mocked(verifyRequest).mockResolvedValue("uid123");
    mockUserFindUnique
      .mockResolvedValueOnce({ id: "u1", role: "admin", churchId: "church1" })
      .mockResolvedValueOnce({ id: "u1", role: "admin", churchId: "church1" });

    const req = new Request("http://localhost/api/users/u1/role", {
      method: "PATCH",
      body: JSON.stringify({ role: "member" }),
    });

    const res = await PATCH(req, makeParams("u1"));
    expect(res.status).toBe(400);
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it("blocks changing a role for a user in a different church", async () => {
    vi.mocked(verifyRequest).mockResolvedValue("uid123");
    mockUserFindUnique
      .mockResolvedValueOnce({ id: "u1", role: "admin", churchId: "church1" })
      .mockResolvedValueOnce({ id: "u2", role: "member", churchId: "church2" });

    const req = new Request("http://localhost/api/users/u2/role", {
      method: "PATCH",
      body: JSON.stringify({ role: "admin" }),
    });

    const res = await PATCH(req, makeParams("u2"));
    expect(res.status).toBe(404);
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it("allows an admin to promote another member in the same church", async () => {
    vi.mocked(verifyRequest).mockResolvedValue("uid123");
    mockUserFindUnique
      .mockResolvedValueOnce({ id: "u1", role: "admin", churchId: "church1" })
      .mockResolvedValueOnce({ id: "u2", role: "member", churchId: "church1" });
    mockUserUpdate.mockResolvedValue({ id: "u2", role: "admin" });

    const req = new Request("http://localhost/api/users/u2/role", {
      method: "PATCH",
      body: JSON.stringify({ role: "admin" }),
    });

    const res = await PATCH(req, makeParams("u2"));
    expect(res.status).toBe(200);
    expect(mockUserUpdate).toHaveBeenCalled();
  });
});
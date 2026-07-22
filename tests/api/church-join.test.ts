import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUserFindUnique = vi.fn();
const mockUserUpdate = vi.fn();
const mockChurchFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      update: (...args: unknown[]) => mockUserUpdate(...args),
    },
    church: {
      findUnique: (...args: unknown[]) => mockChurchFindUnique(...args),
    },
  },
}));

vi.mock("@/lib/verifyAuth", () => ({
  verifyRequest: vi.fn(),
}));

import { POST } from "@/app/api/church/join/route";
import { verifyRequest } from "@/lib/verifyAuth";

describe("POST /api/church/join", () => {
  beforeEach(() => vi.clearAllMocks());

  it("blocks a user who already belongs to a church", async () => {
    vi.mocked(verifyRequest).mockResolvedValue("uid123");
    mockUserFindUnique.mockResolvedValue({ id: "u1", churchId: "church1" });

    const req = new Request("http://localhost/api/church/join", {
      method: "POST",
      body: JSON.stringify({ churchId: "church2" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it("joins a churchless user to an existing church as a regular member", async () => {
    vi.mocked(verifyRequest).mockResolvedValue("uid123");
    mockUserFindUnique.mockResolvedValue({ id: "u1", churchId: null });
    mockChurchFindUnique.mockResolvedValue({ id: "church2", name: "Test Church" });
    mockUserUpdate.mockResolvedValue({ id: "u1", churchId: "church2", role: "member" });

    const req = new Request("http://localhost/api/church/join", {
      method: "POST",
      body: JSON.stringify({ churchId: "church2" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { churchId: "church2", role: "member" } })
    );
  });
});
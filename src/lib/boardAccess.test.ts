import { describe, expect, it, vi, beforeEach } from "vitest";

const findUnique = vi.fn();

vi.mock("./prisma", () => ({
  prisma: { board: { findUnique: (...args: unknown[]) => findUnique(...args) } },
}));

const { getBoardAccess } = await import("./boardAccess");

describe("getBoardAccess", () => {
  beforeEach(() => {
    findUnique.mockReset();
  });

  it("returns not allowed when the board does not exist", async () => {
    findUnique.mockResolvedValue(null);
    const access = await getBoardAccess("board-1", "user-1");
    expect(access).toEqual({ allowed: false, role: null });
  });

  it("grants OWNER access to the board owner", async () => {
    findUnique.mockResolvedValue({ ownerId: "user-1", members: [] });
    const access = await getBoardAccess("board-1", "user-1");
    expect(access).toEqual({ allowed: true, role: "OWNER" });
  });

  it("grants MEMBER access to an invited member", async () => {
    findUnique.mockResolvedValue({ ownerId: "someone-else", members: [{ role: "MEMBER" }] });
    const access = await getBoardAccess("board-1", "user-2");
    expect(access).toEqual({ allowed: true, role: "MEMBER" });
  });

  it("denies access to a user with no relation to the board", async () => {
    findUnique.mockResolvedValue({ ownerId: "someone-else", members: [] });
    const access = await getBoardAccess("board-1", "user-3");
    expect(access).toEqual({ allowed: false, role: null });
  });
});

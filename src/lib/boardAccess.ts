import { prisma } from "@/lib/prisma";

export type BoardAccess = { allowed: boolean; role: "OWNER" | "MEMBER" | null };

export async function getBoardAccess(boardId: string, userId: string): Promise<BoardAccess> {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: {
      ownerId: true,
      members: { where: { userId }, select: { role: true } },
    },
  });

  if (!board) return { allowed: false, role: null };
  if (board.ownerId === userId) return { allowed: true, role: "OWNER" };
  if (board.members.length > 0) return { allowed: true, role: board.members[0].role };
  return { allowed: false, role: null };
}

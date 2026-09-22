import { prisma } from "@/lib/prisma";
import { emitToBoard } from "@/lib/socket";

/** Persists one line of board history and pushes it to everyone viewing the board. */
export async function logActivity(boardId: string, actorId: string, text: string) {
  const activity = await prisma.activity.create({
    data: { boardId, actorId, text: text.slice(0, 200) },
    include: { actor: { select: { id: true, name: true, avatarColor: true } } },
  });
  emitToBoard(boardId, "activity:new", { activity });
  return activity;
}

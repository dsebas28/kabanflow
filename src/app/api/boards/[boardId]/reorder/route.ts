import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBoardAccess } from "@/lib/boardAccess";
import { reorderSchema } from "@/lib/validation";
import { emitToBoard } from "@/lib/socket";

type Params = { params: Promise<{ boardId: string }> };

// Bulk reorder for a drag-and-drop drop: the client sends the final card
// order for every list touched by the drag (1 list if reordering within the
// same list, 2 if a card moved to another list). We re-derive listId +
// position for every card in those lists in one transaction, which is far
// simpler and less error-prone than shifting individual positions.
export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { boardId } = await params;
  const access = await getBoardAccess(boardId, session.user.id);
  if (!access.allowed) return NextResponse.json({ error: "No tienes acceso a este tablero" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const listIds = parsed.data.lists.map((l) => l.id);
  const ownedLists = await prisma.list.findMany({
    where: { id: { in: listIds }, boardId },
    select: { id: true },
  });
  if (ownedLists.length !== listIds.length) {
    return NextResponse.json({ error: "Alguna lista no pertenece a este tablero" }, { status: 400 });
  }

  const cardIds = parsed.data.lists.flatMap((l) => l.cardIds);
  const ownedCards = await prisma.card.count({
    where: { id: { in: cardIds }, list: { boardId } },
  });
  if (ownedCards !== cardIds.length) {
    return NextResponse.json({ error: "Alguna tarjeta no pertenece a este tablero" }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.lists.flatMap((list) =>
      list.cardIds.map((cardId, index) =>
        prisma.card.update({ where: { id: cardId }, data: { listId: list.id, position: index } }),
      ),
    ),
  );

  emitToBoard(boardId, "board:reordered", { lists: parsed.data.lists, movedBy: session.user.id });
  return NextResponse.json({ ok: true });
}

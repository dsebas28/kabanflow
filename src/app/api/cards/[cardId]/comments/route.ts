import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBoardAccess } from "@/lib/boardAccess";
import { createCommentSchema } from "@/lib/validation";
import { emitToBoard } from "@/lib/socket";

type Params = { params: Promise<{ cardId: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { cardId } = await params;
  const card = await prisma.card.findUnique({ where: { id: cardId }, select: { list: { select: { boardId: true } } } });
  if (!card) return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });

  const access = await getBoardAccess(card.list.boardId, session.user.id);
  if (!access.allowed) return NextResponse.json({ error: "No tienes acceso a este tablero" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { body: parsed.data.body, cardId, authorId: session.user.id },
    include: { author: { select: { id: true, name: true, avatarColor: true } } },
  });

  emitToBoard(card.list.boardId, "comment:created", { comment });
  return NextResponse.json({ comment }, { status: 201 });
}

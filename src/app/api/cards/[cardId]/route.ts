import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBoardAccess } from "@/lib/boardAccess";
import { updateCardSchema } from "@/lib/validation";
import { emitToBoard } from "@/lib/socket";
import { logActivity } from "@/lib/activity";
import { removeStoredFiles } from "@/lib/uploads";

type Params = { params: Promise<{ cardId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { cardId } = await params;
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      creator: { select: { id: true, name: true, avatarColor: true } },
      comments: { orderBy: { createdAt: "asc" }, include: { author: { select: { id: true, name: true, avatarColor: true } } } },
      list: { select: { boardId: true } },
      attachments: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          mimeType: true,
          size: true,
          createdAt: true,
          cardId: true,
          uploader: { select: { id: true, name: true, avatarColor: true } },
        },
      },
    },
  });
  if (!card) return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });

  const access = await getBoardAccess(card.list.boardId, session.user.id);
  if (!access.allowed) return NextResponse.json({ error: "No tienes acceso a este tablero" }, { status: 403 });

  return NextResponse.json({ card });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { cardId } = await params;
  const card = await prisma.card.findUnique({ where: { id: cardId }, select: { list: { select: { boardId: true } } } });
  if (!card) return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });

  const access = await getBoardAccess(card.list.boardId, session.user.id);
  if (!access.allowed) return NextResponse.json({ error: "No tienes acceso a este tablero" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = updateCardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const { dueDate, ...rest } = parsed.data;
  const updated = await prisma.card.update({
    where: { id: cardId },
    data: { ...rest, ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}) },
    include: { creator: { select: { id: true, name: true, avatarColor: true } } },
  });

  emitToBoard(card.list.boardId, "card:updated", { card: updated });
  return NextResponse.json({ card: updated });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { cardId } = await params;
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: { title: true, list: { select: { boardId: true } }, attachments: { select: { storedName: true } } },
  });
  if (!card) return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });

  const access = await getBoardAccess(card.list.boardId, session.user.id);
  if (!access.allowed) return NextResponse.json({ error: "No tienes acceso a este tablero" }, { status: 403 });

  await prisma.card.delete({ where: { id: cardId } });
  await removeStoredFiles(card.attachments.map((a) => a.storedName));
  emitToBoard(card.list.boardId, "card:deleted", { cardId });
  await logActivity(card.list.boardId, session.user.id, `eliminó la tarjeta «${card.title}»`);
  return NextResponse.json({ ok: true });
}

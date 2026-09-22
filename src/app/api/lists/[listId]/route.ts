import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBoardAccess } from "@/lib/boardAccess";
import { updateListSchema } from "@/lib/validation";
import { emitToBoard } from "@/lib/socket";
import { logActivity } from "@/lib/activity";
import { removeStoredFiles } from "@/lib/uploads";

type Params = { params: Promise<{ listId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { listId } = await params;
  const list = await prisma.list.findUnique({ where: { id: listId }, select: { boardId: true } });
  if (!list) return NextResponse.json({ error: "Lista no encontrada" }, { status: 404 });

  const access = await getBoardAccess(list.boardId, session.user.id);
  if (!access.allowed) return NextResponse.json({ error: "No tienes acceso a este tablero" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = updateListSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const updated = await prisma.list.update({ where: { id: listId }, data: parsed.data });
  emitToBoard(list.boardId, "list:updated", { list: updated });
  return NextResponse.json({ list: updated });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { listId } = await params;
  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: { title: true, boardId: true, cards: { select: { attachments: { select: { storedName: true } } } } },
  });
  if (!list) return NextResponse.json({ error: "Lista no encontrada" }, { status: 404 });

  const access = await getBoardAccess(list.boardId, session.user.id);
  if (!access.allowed) return NextResponse.json({ error: "No tienes acceso a este tablero" }, { status: 403 });

  await prisma.list.delete({ where: { id: listId } });
  await removeStoredFiles(list.cards.flatMap((c) => c.attachments.map((a) => a.storedName)));
  emitToBoard(list.boardId, "list:deleted", { listId });
  await logActivity(list.boardId, session.user.id, `eliminó la lista «${list.title}»`);
  return NextResponse.json({ ok: true });
}

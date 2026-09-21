import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBoardAccess } from "@/lib/boardAccess";
import { createCardSchema } from "@/lib/validation";
import { emitToBoard } from "@/lib/socket";

type Params = { params: Promise<{ listId: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { listId } = await params;
  const list = await prisma.list.findUnique({ where: { id: listId }, select: { boardId: true } });
  if (!list) return NextResponse.json({ error: "Lista no encontrada" }, { status: 404 });

  const access = await getBoardAccess(list.boardId, session.user.id);
  if (!access.allowed) return NextResponse.json({ error: "No tienes acceso a este tablero" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = createCardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const last = await prisma.card.findFirst({ where: { listId }, orderBy: { position: "desc" } });
  const card = await prisma.card.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      listId,
      position: last ? last.position + 1 : 0,
      creatorId: session.user.id,
    },
    include: { creator: { select: { id: true, name: true, avatarColor: true } } },
  });

  emitToBoard(list.boardId, "card:created", { card });
  return NextResponse.json({ card }, { status: 201 });
}

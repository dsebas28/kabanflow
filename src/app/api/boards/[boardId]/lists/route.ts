import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBoardAccess } from "@/lib/boardAccess";
import { createListSchema } from "@/lib/validation";
import { emitToBoard } from "@/lib/socket";

type Params = { params: Promise<{ boardId: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { boardId } = await params;
  const access = await getBoardAccess(boardId, session.user.id);
  if (!access.allowed) return NextResponse.json({ error: "No tienes acceso a este tablero" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = createListSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const last = await prisma.list.findFirst({ where: { boardId }, orderBy: { position: "desc" } });
  const list = await prisma.list.create({
    data: { title: parsed.data.title, boardId, position: last ? last.position + 1 : 0 },
    include: { cards: true },
  });

  emitToBoard(boardId, "list:created", { list });
  return NextResponse.json({ list }, { status: 201 });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBoardAccess } from "@/lib/boardAccess";
import { createMessageSchema } from "@/lib/validation";
import { emitToBoard } from "@/lib/socket";

type Params = { params: Promise<{ boardId: string }> };

const AUTHOR = { select: { id: true, name: true, avatarColor: true } } as const;

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { boardId } = await params;
  const access = await getBoardAccess(boardId, session.user.id);
  if (!access.allowed) return NextResponse.json({ error: "No tienes acceso a este tablero" }, { status: 403 });

  const latest = await prisma.message.findMany({
    where: { boardId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { author: AUTHOR },
  });

  return NextResponse.json({ messages: latest.reverse() });
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { boardId } = await params;
  const access = await getBoardAccess(boardId, session.user.id);
  if (!access.allowed) return NextResponse.json({ error: "No tienes acceso a este tablero" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = createMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: { body: parsed.data.body, boardId, authorId: session.user.id },
    include: { author: AUTHOR },
  });

  emitToBoard(boardId, "chat:message", { message });
  return NextResponse.json({ message }, { status: 201 });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBoardAccess } from "@/lib/boardAccess";
import { updateBoardSchema } from "@/lib/validation";
import { removeStoredFiles } from "@/lib/uploads";

type Params = { params: Promise<{ boardId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { boardId } = await params;
  const access = await getBoardAccess(boardId, session.user.id);
  if (!access.allowed) return NextResponse.json({ error: "No tienes acceso a este tablero" }, { status: 403 });

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      owner: { select: { id: true, name: true, avatarColor: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, avatarColor: true } } } },
      lists: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            orderBy: { position: "asc" },
            include: { creator: { select: { id: true, name: true, avatarColor: true } } },
          },
        },
      },
    },
  });

  if (!board) return NextResponse.json({ error: "Tablero no encontrado" }, { status: 404 });

  return NextResponse.json({ board, role: access.role });
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { boardId } = await params;
  const access = await getBoardAccess(boardId, session.user.id);
  if (access.role !== "OWNER") return NextResponse.json({ error: "Solo el dueño puede editar el tablero" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = updateBoardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const board = await prisma.board.update({ where: { id: boardId }, data: parsed.data });
  return NextResponse.json({ board });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { boardId } = await params;
  const access = await getBoardAccess(boardId, session.user.id);
  if (access.role !== "OWNER") return NextResponse.json({ error: "Solo el dueño puede eliminar el tablero" }, { status: 403 });

  const files = await prisma.attachment.findMany({ where: { card: { list: { boardId } } }, select: { storedName: true } });
  await prisma.board.delete({ where: { id: boardId } });
  await removeStoredFiles(files.map((f) => f.storedName));
  return NextResponse.json({ ok: true });
}

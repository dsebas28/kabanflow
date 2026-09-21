import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBoardAccess } from "@/lib/boardAccess";
import { inviteMemberSchema } from "@/lib/validation";
import { emitToBoard } from "@/lib/socket";

type Params = { params: Promise<{ boardId: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { boardId } = await params;
  const access = await getBoardAccess(boardId, session.user.id);
  if (access.role !== "OWNER") return NextResponse.json({ error: "Solo el dueño puede invitar miembros" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = inviteMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const invitedUser = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!invitedUser) return NextResponse.json({ error: "No existe ninguna cuenta con ese correo" }, { status: 404 });

  const board = await prisma.board.findUnique({ where: { id: boardId }, select: { ownerId: true } });
  if (board?.ownerId === invitedUser.id) {
    return NextResponse.json({ error: "Esa persona ya es dueña del tablero" }, { status: 409 });
  }

  const member = await prisma.boardMember.upsert({
    where: { boardId_userId: { boardId, userId: invitedUser.id } },
    update: {},
    create: { boardId, userId: invitedUser.id },
    include: { user: { select: { id: true, name: true, email: true, avatarColor: true } } },
  });

  emitToBoard(boardId, "member:added", { member });
  return NextResponse.json({ member }, { status: 201 });
}

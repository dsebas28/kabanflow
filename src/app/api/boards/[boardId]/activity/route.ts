import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBoardAccess } from "@/lib/boardAccess";

type Params = { params: Promise<{ boardId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { boardId } = await params;
  const access = await getBoardAccess(boardId, session.user.id);
  if (!access.allowed) return NextResponse.json({ error: "No tienes acceso a este tablero" }, { status: 403 });

  const activities = await prisma.activity.findMany({
    where: { boardId },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { actor: { select: { id: true, name: true, avatarColor: true } } },
  });

  return NextResponse.json({ activities });
}

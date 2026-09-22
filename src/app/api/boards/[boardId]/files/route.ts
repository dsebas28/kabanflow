import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBoardAccess } from "@/lib/boardAccess";

type Params = { params: Promise<{ boardId: string }> };

/** Every file attached to any card on the board, newest first. */
export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { boardId } = await params;
  const access = await getBoardAccess(boardId, session.user.id);
  if (!access.allowed) return NextResponse.json({ error: "No tienes acceso a este tablero" }, { status: 403 });

  const files = await prisma.attachment.findMany({
    where: { card: { list: { boardId } } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      mimeType: true,
      size: true,
      createdAt: true,
      cardId: true,
      card: { select: { title: true } },
      uploader: { select: { id: true, name: true, avatarColor: true } },
    },
  });

  return NextResponse.json({ files });
}

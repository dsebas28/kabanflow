import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createBoardSchema } from "@/lib/validation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const boards = await prisma.board.findMany({
    where: {
      OR: [{ ownerId: session.user.id }, { members: { some: { userId: session.user.id } } }],
    },
    include: {
      owner: { select: { id: true, name: true, avatarColor: true } },
      members: { take: 3, include: { user: { select: { id: true, name: true, avatarColor: true } } } },
      lists: {
        orderBy: { position: "asc" },
        select: { _count: { select: { cards: true } } },
      },
      _count: { select: { lists: true, members: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Progress heuristic: cards sitting in the last list count as done.
  const summaries = boards.map(({ lists, ...board }) => ({
    ...board,
    cardCount: lists.reduce((sum, l) => sum + l._count.cards, 0),
    doneCount: lists.length > 1 ? lists[lists.length - 1]._count.cards : 0,
  }));

  return NextResponse.json({ boards: summaries });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createBoardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const board = await prisma.board.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      color: parsed.data.color ?? "#4F46E5",
      ownerId: session.user.id,
      lists: {
        create: [
          { title: "Por hacer", position: 0 },
          { title: "En progreso", position: 1 },
          { title: "Hecho", position: 2 },
        ],
      },
    },
    include: { lists: true },
  });

  return NextResponse.json({ board }, { status: 201 });
}

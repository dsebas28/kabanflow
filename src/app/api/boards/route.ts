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
      owner: { select: { id: true, name: true } },
      _count: { select: { lists: true, members: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ boards });
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

import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBoardAccess } from "@/lib/boardAccess";
import BoardView from "@/components/board/BoardView";

export default async function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { boardId } = await params;
  const access = await getBoardAccess(boardId, session.user.id);
  if (!access.allowed) notFound();

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
            include: {
              creator: { select: { id: true, name: true, avatarColor: true } },
              _count: { select: { attachments: true, comments: true } },
            },
          },
        },
      },
    },
  });

  if (!board) notFound();

  const serialized = JSON.parse(JSON.stringify(board));

  return (
    <BoardView
      board={serialized}
      currentUser={{ id: session.user.id, name: session.user.name ?? "Sin nombre", color: session.user.image ?? "#7c3aed" }}
    />
  );
}

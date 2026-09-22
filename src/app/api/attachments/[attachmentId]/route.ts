import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBoardAccess } from "@/lib/boardAccess";
import { emitToBoard } from "@/lib/socket";
import { logActivity } from "@/lib/activity";
import { ALLOWED_MIME, INLINE_MIME, removeStoredFiles, storedPath } from "@/lib/uploads";

type Params = { params: Promise<{ attachmentId: string }> };

async function loadAttachment(attachmentId: string) {
  return prisma.attachment.findUnique({
    where: { id: attachmentId },
    include: { card: { select: { title: true, list: { select: { boardId: true } } } } },
  });
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { attachmentId } = await params;
  const attachment = await loadAttachment(attachmentId);
  if (!attachment) return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });

  const access = await getBoardAccess(attachment.card.list.boardId, session.user.id);
  if (!access.allowed) return NextResponse.json({ error: "No tienes acceso a este tablero" }, { status: 403 });

  let data: Buffer;
  try {
    data = await readFile(storedPath(attachment.storedName));
  } catch {
    return NextResponse.json({ error: "El archivo ya no está disponible" }, { status: 410 });
  }

  const mime = ALLOWED_MIME.has(attachment.mimeType) ? attachment.mimeType : "application/octet-stream";
  const disposition = INLINE_MIME.has(mime) ? "inline" : "attachment";

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": mime,
      "Content-Length": String(data.length),
      "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(attachment.name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=3600",
    },
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { attachmentId } = await params;
  const attachment = await loadAttachment(attachmentId);
  if (!attachment) return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });

  const boardId = attachment.card.list.boardId;
  const access = await getBoardAccess(boardId, session.user.id);
  if (!access.allowed) return NextResponse.json({ error: "No tienes acceso a este tablero" }, { status: 403 });
  if (attachment.uploaderId !== session.user.id && access.role !== "OWNER") {
    return NextResponse.json({ error: "Solo quien lo subió o el dueño del tablero puede eliminarlo" }, { status: 403 });
  }

  await prisma.attachment.delete({ where: { id: attachmentId } });
  await removeStoredFiles([attachment.storedName]);

  emitToBoard(boardId, "attachment:deleted", { attachmentId, cardId: attachment.cardId });
  await logActivity(boardId, session.user.id, `eliminó «${attachment.name}» de «${attachment.card.title}»`);
  return NextResponse.json({ ok: true });
}

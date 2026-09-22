import { NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import { createId } from "@/lib/id";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBoardAccess } from "@/lib/boardAccess";
import { emitToBoard } from "@/lib/socket";
import { logActivity } from "@/lib/activity";
import {
  ALLOWED_MIME,
  MAX_UPLOAD_BYTES,
  ensureUploadDir,
  looksLikeImage,
  safeExtension,
  sanitizeFileName,
  storedPath,
} from "@/lib/uploads";

type Params = { params: Promise<{ cardId: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { cardId } = await params;
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: { title: true, list: { select: { boardId: true } } },
  });
  if (!card) return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });

  const boardId = card.list.boardId;
  const access = await getBoardAccess(boardId, session.user.id);
  if (!access.allowed) return NextResponse.json({ error: "No tienes acceso a este tablero" }, { status: 403 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Adjunta un archivo" }, { status: 400 });

  if (file.size === 0) return NextResponse.json({ error: "El archivo está vacío" }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "El archivo supera el máximo de 5 MB" }, { status: 413 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: "Ese tipo de archivo no está permitido. Usa imágenes, PDF, texto, Office o ZIP." }, { status: 415 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!looksLikeImage(file.type, bytes)) {
    return NextResponse.json({ error: "El contenido no coincide con el tipo de imagen indicado" }, { status: 400 });
  }

  const name = sanitizeFileName(file.name);
  const storedName = `${createId()}${safeExtension(name)}`;
  await ensureUploadDir();
  await writeFile(storedPath(storedName), bytes);

  const attachment = await prisma.attachment.create({
    data: { name, mimeType: file.type, size: file.size, storedName, cardId, uploaderId: session.user.id },
    select: {
      id: true,
      name: true,
      mimeType: true,
      size: true,
      createdAt: true,
      cardId: true,
      uploader: { select: { id: true, name: true, avatarColor: true } },
    },
  });

  emitToBoard(boardId, "attachment:added", { attachment: { ...attachment, card: { title: card.title } } });
  await logActivity(boardId, session.user.id, `adjuntó «${name}» a «${card.title}»`);
  return NextResponse.json({ attachment }, { status: 201 });
}

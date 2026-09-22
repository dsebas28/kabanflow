"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Download, Loader2, Paperclip, Send, Trash2, UploadCloud, X } from "lucide-react";
import toast from "react-hot-toast";
import Avatar from "@/components/Avatar";
import FileThumb from "@/components/board/FileThumb";
import { useSocket } from "@/context/SocketContext";
import { formatBytes } from "@/lib/format";
import type { AttachmentModel, CardModel, CommentModel } from "@/types/models";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

type Props = {
  card: CardModel | null;
  onClose: () => void;
  onUpdate: (cardId: string, patch: Partial<Pick<CardModel, "title" | "description" | "dueDate">>) => void;
  onDelete: (cardId: string) => void;
  isOwner: boolean;
  currentUserId: string;
};

export default function CardDetailModal({ card, onClose, onUpdate, onDelete, isOwner, currentUserId }: Props) {
  return (
    <AnimatePresence>
      {card && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={onClose}
        >
          {/* Keyed by card.id so switching cards remounts this with fresh
              local state instead of syncing props into state via an effect. */}
          <CardDetailModalContent key={card.id} card={card} onClose={onClose} onUpdate={onUpdate} onDelete={onDelete} isOwner={isOwner} currentUserId={currentUserId} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CardDetailModalContent({ card, onClose, onUpdate, onDelete, isOwner, currentUserId }: Props & { card: CardModel }) {
  const socket = useSocket();
  const [attachments, setAttachments] = useState<AttachmentModel[]>([]);
  const [uploading, setUploading] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.slice(0, 10) : "");
  const [comments, setComments] = useState<CommentModel[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetch(`/api/cards/${card.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (ignore) return;
        if (data?.card?.comments) setComments(data.card.comments);
        if (data?.card?.attachments) setAttachments((prev) => [...data.card.attachments, ...prev.filter((p) => !data.card.attachments.some((a: AttachmentModel) => a.id === p.id))]);
        setLoadingComments(false);
      });
    return () => {
      ignore = true;
    };
  }, [card.id]);

  useEffect(() => {
    if (!socket) return;
    const onAdded = ({ attachment }: { attachment: AttachmentModel }) => {
      if (attachment.cardId !== card.id) return;
      setAttachments((prev) => (prev.some((a) => a.id === attachment.id) ? prev : [attachment, ...prev]));
    };
    const onDeleted = ({ attachmentId, cardId }: { attachmentId: string; cardId: string }) => {
      if (cardId === card.id) setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    };
    socket.on("attachment:added", onAdded);
    socket.on("attachment:deleted", onDeleted);
    return () => {
      socket.off("attachment:added", onAdded);
      socket.off("attachment:deleted", onDeleted);
    };
  }, [socket, card.id]);

  const uploadFiles = async (fileList: FileList | File[]) => {
    for (const file of Array.from(fileList)) {
      if (file.size > MAX_UPLOAD_BYTES) {
        toast.error("«" + file.name + "» pesa más de 5 MB");
        continue;
      }
      setUploading((n) => n + 1);
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/cards/" + card.id + "/attachments", { method: "POST", body: form });
      setUploading((n) => n - 1);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "No se pudo subir el archivo");
        continue;
      }
      setAttachments((prev) => (prev.some((a) => a.id === data.attachment.id) ? prev : [data.attachment, ...prev]));
    }
  };

  const removeAttachment = async (id: string) => {
    const res = await fetch("/api/attachments/" + id, { method: "DELETE" });
    if (!res.ok) {
      toast.error("No se pudo eliminar el archivo");
      return;
    }
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const saveTitle = () => {
    if (title.trim() && title.trim() !== card.title) onUpdate(card.id, { title: title.trim() });
  };

  const saveDescription = () => {
    if (description !== (card.description ?? "")) onUpdate(card.id, { description: description || null });
  };

  const saveDueDate = (value: string) => {
    setDueDate(value);
    onUpdate(card.id, { dueDate: value ? new Date(value).toISOString() : null });
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setPostingComment(true);
    const res = await fetch(`/api/cards/${card.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: commentBody.trim() }),
    });
    setPostingComment(false);
    if (!res.ok) {
      toast.error("No se pudo enviar el comentario");
      return;
    }
    const data = await res.json();
    setComments((prev) => [...prev, data.comment]);
    setCommentBody("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 10 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => e.stopPropagation()}
      className="card-surface flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden shadow-2xl"
    >
      <div className="flex items-start justify-between gap-3 border-b border-border p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          className="w-full bg-transparent text-base font-bold outline-none"
        />
        <button type="button" onClick={onClose} className="btn-ghost !p-1.5 flex-shrink-0" aria-label="Cerrar">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-dim">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={saveDescription}
            rows={3}
            placeholder="Agrega más contexto..."
            className="input-base resize-none text-sm"
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-dim">
            <Calendar className="h-3.5 w-3.5" /> Fecha límite
          </label>
          <input type="date" value={dueDate} onChange={(e) => saveDueDate(e.target.value)} className="input-base text-sm" />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-dim">
            <Paperclip className="h-3.5 w-3.5" /> Archivos
          </label>
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
            }}
            className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center text-xs transition-colors ${
              dragOver ? "border-brand-500 bg-brand-500/10 text-brand-600" : "border-border text-ink-dim hover:border-brand-500/50"
            }`}
          >
            <input
              type="file"
              multiple
              className="sr-only"
              onChange={(e) => {
                if (e.target.files?.length) uploadFiles(e.target.files);
                e.target.value = "";
              }}
            />
            {uploading > 0 ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
            <span className="font-semibold">{uploading > 0 ? "Subiendo..." : "Suelta archivos aquí o haz clic"}</span>
            <span className="text-ink-faint">Imágenes, PDF, Office, texto o ZIP · máximo 5 MB</span>
          </label>

          {attachments.length > 0 && (
            <ul className="mt-3 space-y-2">
              {attachments.map((a) => (
                <li key={a.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-2">
                  <FileThumb id={a.id} name={a.name} mimeType={a.mimeType} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" title={a.name}>{a.name}</p>
                    <p className="text-[11px] text-ink-faint">{formatBytes(a.size)} · {a.uploader.name}</p>
                  </div>
                  <a href={"/api/attachments/" + a.id} target="_blank" rel="noreferrer" download={a.name} aria-label={"Descargar " + a.name} className="btn-ghost !p-2">
                    <Download className="h-4 w-4" />
                  </a>
                  {(isOwner || a.uploader.id === currentUserId) && (
                    <button type="button" onClick={() => removeAttachment(a.id)} aria-label={"Eliminar " + a.name} className="btn-ghost !p-2 hover:!text-error-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-ink-dim">Comentarios</label>
          {loadingComments ? (
            <Loader2 className="h-4 w-4 animate-spin text-ink-faint" />
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <Avatar name={c.author.name} color={c.author.avatarColor} size={26} />
                  <div className="flex-1 rounded-xl bg-surface-alt p-2.5">
                    <div className="flex items-center gap-2 text-[11px] text-ink-faint">
                      <span className="font-bold text-ink">{c.author.name}</span>
                      <span>{new Date(c.createdAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-ink">{c.body}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <p className="text-xs text-ink-faint">Sin comentarios todavía.</p>}
            </div>
          )}

          <form onSubmit={submitComment} className="mt-3 flex items-center gap-2">
            <input
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Escribe un comentario..."
              className="input-base text-sm"
            />
            <button type="submit" disabled={postingComment} className="btn-primary !p-2.5" aria-label="Enviar comentario">
              {postingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={() => {
            onDelete(card.id);
            onClose();
          }}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-error-500 hover:bg-error-500/10 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" /> Eliminar tarjeta
        </button>
      </div>
    </motion.div>
  );
}

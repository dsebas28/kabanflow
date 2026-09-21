"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Loader2, Send, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import Avatar from "@/components/Avatar";
import type { CardModel, CommentModel } from "@/types/models";

type Props = {
  card: CardModel | null;
  onClose: () => void;
  onUpdate: (cardId: string, patch: Partial<Pick<CardModel, "title" | "description" | "dueDate">>) => void;
  onDelete: (cardId: string) => void;
};

export default function CardDetailModal({ card, onClose, onUpdate, onDelete }: Props) {
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
          <CardDetailModalContent key={card.id} card={card} onClose={onClose} onUpdate={onUpdate} onDelete={onDelete} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CardDetailModalContent({ card, onClose, onUpdate, onDelete }: Props & { card: CardModel }) {
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
        setLoadingComments(false);
      });
    return () => {
      ignore = true;
    };
  }, [card.id]);

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

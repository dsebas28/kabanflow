"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, MessageSquare, Paperclip } from "lucide-react";
import Avatar from "@/components/Avatar";
import TiltWrapper from "@/components/TiltWrapper";
import type { CardModel } from "@/types/models";

export default function CardItem({
  card,
  onClick,
  dragging = false,
  dimmed = false,
}: {
  card: CardModel;
  onClick?: () => void;
  dragging?: boolean;
  dimmed?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : dimmed ? 0.3 : 1,
  };

  // Lazy initializer runs once on mount, not on every render — keeps the
  // "due soon" check pure without re-evaluating Date.now() during render.
  const [now] = useState(() => Date.now());
  const dueSoon = card.dueDate && new Date(card.dueDate).getTime() - now < 1000 * 60 * 60 * 24 * 2;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`card-in cursor-grab select-none transition-opacity duration-200 active:cursor-grabbing ${dragging ? "rotate-2 scale-105" : ""}`}
    >
      <TiltWrapper
        className={`rounded-xl border border-border bg-surface p-3.5 text-left shadow-sm transition-colors hover:border-brand-500/40 hover:shadow-md ${dragging ? "border-brand-500/60 shadow-2xl" : ""}`}
      >
        <p className="text-sm font-medium leading-snug text-ink">{card.title}</p>
        {((card._count?.attachments ?? 0) > 0 || (card._count?.comments ?? 0) > 0) && (
          <div className="mt-2 flex items-center gap-3 text-[11px] text-ink-faint">
            {(card._count?.attachments ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1" title="Archivos adjuntos">
                <Paperclip className="h-3 w-3" /> {card._count?.attachments}
              </span>
            )}
            {(card._count?.comments ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1" title="Comentarios">
                <MessageSquare className="h-3 w-3" /> {card._count?.comments}
              </span>
            )}
          </div>
        )}
        <div className="mt-2 flex items-center justify-between">
          {card.dueDate ? (
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${dueSoon ? "text-error-500" : "text-ink-faint"}`}>
              <Calendar className="h-3 w-3" />
              {new Date(card.dueDate).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
            </span>
          ) : (
            <span />
          )}
          <Avatar name={card.creator.name} color={card.creator.avatarColor} size={20} />
        </div>
      </TiltWrapper>
    </div>
  );
}

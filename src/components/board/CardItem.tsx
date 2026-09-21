"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar } from "lucide-react";
import Avatar from "@/components/Avatar";
import TiltWrapper from "@/components/TiltWrapper";
import type { CardModel } from "@/types/models";

export default function CardItem({
  card,
  onClick,
  dragging = false,
}: {
  card: CardModel;
  onClick?: () => void;
  dragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
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
      className={`cursor-grab select-none active:cursor-grabbing ${dragging ? "rotate-2" : ""}`}
    >
      <TiltWrapper
        className={`rounded-xl border border-border bg-surface p-3 text-left shadow-sm hover:shadow-md ${dragging ? "shadow-lg" : ""}`}
      >
        <p className="text-sm font-medium leading-snug text-ink">{card.title}</p>
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

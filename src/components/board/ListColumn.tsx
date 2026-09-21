"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal, Plus, Trash2, X } from "lucide-react";
import CardItem from "./CardItem";
import type { CardModel, ListModel } from "@/types/models";

export default function ListColumn({
  list,
  onCardClick,
  onAddCard,
  onDeleteList,
  query = "",
  accent = "#94a3b8",
}: {
  list: ListModel;
  onCardClick: (card: CardModel) => void;
  onAddCard: (listId: string, title: string) => void;
  onDeleteList: (listId: string) => void;
  query?: string;
  accent?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: list.id });
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const q = query.trim().toLowerCase();
  const matches = q ? list.cards.filter((c) => c.title.toLowerCase().includes(q)).length : list.cards.length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setAdding(false);
      return;
    }
    onAddCard(list.id, title.trim());
    setTitle("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex w-[17.5rem] flex-shrink-0 flex-col rounded-2xl border bg-surface-alt/70 p-3 backdrop-blur-sm transition-colors sm:w-72 ${
        isOver ? "border-brand-500/50 bg-brand-500/5" : "border-border/70"
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
          <h3 className="font-display text-sm font-bold">{list.title}</h3>
          <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold tabular-nums text-ink-dim">
            {q ? `${matches}/${list.cards.length}` : list.cards.length}
          </span>
        </div>
        <div className="relative">
          <button type="button" onClick={() => setMenuOpen((v) => !v)} className="btn-ghost !p-1" aria-label="Opciones de la lista">
            <MoreHorizontal className="h-4 w-4" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-8 z-10 w-44 origin-top-right rounded-xl border border-border bg-surface p-1 shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDeleteList(list.id);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-error-500 hover:bg-error-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Eliminar lista
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div ref={setNodeRef} className="flex min-h-[64px] flex-1 flex-col gap-2.5">
        <SortableContext items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
              dimmed={Boolean(q) && !card.title.toLowerCase().includes(q)}
            />
          ))}
        </SortableContext>
        {list.cards.length === 0 && (
          <div
            className={`flex flex-1 items-center justify-center rounded-xl border border-dashed px-3 py-6 text-center text-xs transition-colors ${
              isOver ? "border-brand-500/60 text-brand-600" : "border-border text-ink-faint"
            }`}
          >
            Suelta una tarjeta aquí
          </div>
        )}
      </div>

      {adding ? (
        <form onSubmit={submit} className="mt-3">
          <textarea
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(e);
              }
              if (e.key === "Escape") setAdding(false);
            }}
            placeholder="¿Qué hay que hacer?"
            rows={2}
            className="input-base resize-none text-sm"
          />
          <div className="mt-1.5 flex items-center gap-2">
            <button type="submit" className="btn-primary !px-3 !py-1.5 text-xs">
              Agregar
            </button>
            <button type="button" onClick={() => setAdding(false)} className="btn-ghost !p-1.5" aria-label="Cancelar">
              <X className="h-4 w-4" />
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="group mt-3 flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-ink-dim transition-colors hover:bg-surface hover:text-ink"
        >
          <Plus className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-90" /> Agregar tarjeta
        </button>
      )}
    </motion.div>
  );
}

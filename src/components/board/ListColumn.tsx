"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { MoreHorizontal, Plus, Trash2, X } from "lucide-react";
import CardItem from "./CardItem";
import type { CardModel, ListModel } from "@/types/models";

export default function ListColumn({
  list,
  onCardClick,
  onAddCard,
  onDeleteList,
}: {
  list: ListModel;
  onCardClick: (card: CardModel) => void;
  onAddCard: (listId: string, title: string) => void;
  onDeleteList: (listId: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id: list.id });
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

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
    <div className="flex w-72 flex-shrink-0 flex-col rounded-2xl bg-surface-alt p-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-sm font-bold">
          {list.title} <span className="ml-1 text-xs font-normal text-ink-faint">{list.cards.length}</span>
        </h3>
        <div className="relative">
          <button type="button" onClick={() => setMenuOpen((v) => !v)} className="btn-ghost !p-1" aria-label="Opciones de la lista">
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-10 w-40 rounded-xl border border-border bg-surface p-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteList(list.id);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-error-500 hover:bg-error-500/10 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Eliminar lista
              </button>
            </div>
          )}
        </div>
      </div>

      <div ref={setNodeRef} className="flex min-h-[10px] flex-1 flex-col gap-2">
        <SortableContext items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <CardItem key={card.id} card={card} onClick={() => onCardClick(card)} />
          ))}
        </SortableContext>
      </div>

      {adding ? (
        <form onSubmit={submit} className="mt-2">
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
            placeholder="Título de la tarjeta..."
            rows={2}
            className="input-base resize-none text-sm"
          />
          <div className="mt-1.5 flex items-center gap-2">
            <button type="submit" className="btn-primary !py-1.5 !px-3 text-xs">
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
          className="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-ink-dim hover:bg-surface hover:text-ink cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> Agregar tarjeta
        </button>
      )}
    </div>
  );
}

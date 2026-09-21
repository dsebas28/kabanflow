"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import { useSocket } from "@/context/SocketContext";
import ListColumn from "./ListColumn";
import CardItem from "./CardItem";
import CardDetailModal from "./CardDetailModal";
import InviteMemberModal from "./InviteMemberModal";
import PresenceBar, { type PresenceUser } from "./PresenceBar";
import Avatar from "@/components/Avatar";
import type { BoardDetail, BoardMemberModel, CardModel, ListModel } from "@/types/models";

const LIST_ACCENTS = ["#94a3b8", "#7c3aed", "#f59e0b", "#14b8a6", "#ec4899", "#0ea5e9"];

type Props = {
  board: BoardDetail;
  currentUser: PresenceUser;
};

export default function BoardView({ board, currentUser }: Props) {
  const socket = useSocket();
  const [lists, setLists] = useState<ListModel[]>(board.lists);
  const [members, setMembers] = useState<BoardMemberModel[]>(board.members);
  const [activeCard, setActiveCard] = useState<CardModel | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardModel | null>(null);
  const [presence, setPresence] = useState<Record<string, PresenceUser & { lastSeen: number }>>({});
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [query, setQuery] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    if (!socket) return;

    socket.emit("board:join", board.id);
    const sendPresence = () => socket.emit("presence:update", { boardId: board.id, user: currentUser });
    sendPresence();
    const heartbeat = setInterval(sendPresence, 10000);

    const onCardCreated = ({ card }: { card: CardModel }) => {
      setLists((prev) =>
        prev.map((l) =>
          l.id === card.listId ? (l.cards.some((c) => c.id === card.id) ? l : { ...l, cards: [...l.cards, card] }) : l,
        ),
      );
    };
    const onCardUpdated = ({ card }: { card: CardModel }) => {
      setLists((prev) =>
        prev.map((l) => (l.id === card.listId ? { ...l, cards: l.cards.map((c) => (c.id === card.id ? card : c)) } : l)),
      );
      setSelectedCard((prev) => (prev && prev.id === card.id ? card : prev));
    };
    const onCardDeleted = ({ cardId }: { cardId: string }) => {
      setLists((prev) => prev.map((l) => ({ ...l, cards: l.cards.filter((c) => c.id !== cardId) })));
    };
    const onListCreated = ({ list }: { list: ListModel }) => {
      setLists((prev) => (prev.some((l) => l.id === list.id) ? prev : [...prev, list]));
    };
    const onListUpdated = ({ list }: { list: Partial<ListModel> & { id: string } }) => {
      setLists((prev) => prev.map((l) => (l.id === list.id ? { ...l, ...list } : l)));
    };
    const onListDeleted = ({ listId }: { listId: string }) => {
      setLists((prev) => prev.filter((l) => l.id !== listId));
    };
    const onReordered = ({ lists: order }: { lists: { id: string; cardIds: string[] }[] }) => {
      setLists((prev) => {
        const cardsById = new Map(prev.flatMap((l) => l.cards).map((c) => [c.id, c]));
        const next = prev.map((l) => ({ ...l }));
        for (const entry of order) {
          const target = next.find((l) => l.id === entry.id);
          if (!target) continue;
          target.cards = entry.cardIds
            .map((id) => cardsById.get(id))
            .filter((c): c is CardModel => Boolean(c))
            .map((c) => ({ ...c, listId: entry.id }));
        }
        return next;
      });
    };
    const onMemberAdded = ({ member }: { member: BoardMemberModel }) => {
      setMembers((prev) => (prev.some((m) => m.id === member.id) ? prev : [...prev, member]));
    };
    const onPresence = (user: PresenceUser) => {
      setPresence((prev) => ({ ...prev, [user.id]: { ...user, lastSeen: Date.now() } }));
    };

    socket.on("card:created", onCardCreated);
    socket.on("card:updated", onCardUpdated);
    socket.on("card:deleted", onCardDeleted);
    socket.on("list:created", onListCreated);
    socket.on("list:updated", onListUpdated);
    socket.on("list:deleted", onListDeleted);
    socket.on("board:reordered", onReordered);
    socket.on("member:added", onMemberAdded);
    socket.on("presence:update", onPresence);

    return () => {
      clearInterval(heartbeat);
      socket.emit("board:leave", board.id);
      socket.off("card:created", onCardCreated);
      socket.off("card:updated", onCardUpdated);
      socket.off("card:deleted", onCardDeleted);
      socket.off("list:created", onListCreated);
      socket.off("list:updated", onListUpdated);
      socket.off("list:deleted", onListDeleted);
      socket.off("board:reordered", onReordered);
      socket.off("member:added", onMemberAdded);
      socket.off("presence:update", onPresence);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, board.id]);

  useEffect(() => {
    const id = setInterval(() => {
      setPresence((prev) => {
        const now = Date.now();
        const next: typeof prev = {};
        for (const [k, v] of Object.entries(prev)) if (now - v.lastSeen < 25000) next[k] = v;
        return next;
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const findContainer = useCallback(
    (id: string) => {
      if (lists.some((l) => l.id === id)) return id;
      return lists.find((l) => l.cards.some((c) => c.id === id))?.id;
    },
    [lists],
  );

  const handleDragStart = (event: DragStartEvent) => {
    const card = lists.flatMap((l) => l.cards).find((c) => c.id === event.active.id);
    setActiveCard(card ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeContainer = findContainer(String(active.id));
    const overContainer = findContainer(String(over.id));
    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setLists((prev) => {
      const activeList = prev.find((l) => l.id === activeContainer);
      const overList = prev.find((l) => l.id === overContainer);
      if (!activeList || !overList) return prev;
      const movingCard = activeList.cards.find((c) => c.id === active.id);
      if (!movingCard) return prev;
      const overIndex = overList.cards.findIndex((c) => c.id === over.id);
      const insertIndex = overIndex >= 0 ? overIndex : overList.cards.length;

      return prev.map((l) => {
        if (l.id === activeContainer) return { ...l, cards: l.cards.filter((c) => c.id !== active.id) };
        if (l.id === overContainer) {
          const newCards = [...l.cards];
          newCards.splice(insertIndex, 0, { ...movingCard, listId: overContainer });
          return { ...l, cards: newCards };
        }
        return l;
      });
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const activeContainer = findContainer(String(active.id));
    const overContainer = findContainer(String(over.id)) ?? activeContainer;
    if (!activeContainer || !overContainer) return;

    let finalLists = lists;
    if (activeContainer === overContainer && active.id !== over.id) {
      const list = lists.find((l) => l.id === activeContainer);
      if (list) {
        const oldIndex = list.cards.findIndex((c) => c.id === active.id);
        const newIndex = list.cards.findIndex((c) => c.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const reordered = arrayMove(list.cards, oldIndex, newIndex);
          finalLists = lists.map((l) => (l.id === activeContainer ? { ...l, cards: reordered } : l));
          setLists(finalLists);
        }
      }
    }

    const affectedIds = Array.from(new Set([activeContainer, overContainer]));
    const payload = {
      lists: affectedIds.map((id) => ({
        id,
        cardIds: finalLists.find((l) => l.id === id)?.cards.map((c) => c.id) ?? [],
      })),
    };

    const res = await fetch(`/api/boards/${board.id}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) toast.error("No se pudo guardar el orden, recarga la página");
  };

  const handleAddCard = async (listId: string, title: string) => {
    const res = await fetch(`/api/lists/${listId}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) toast.error("No se pudo crear la tarjeta");
  };

  const handleDeleteList = async (listId: string) => {
    if (!window.confirm("¿Eliminar esta lista y todas sus tarjetas?")) return;
    const res = await fetch(`/api/lists/${listId}`, { method: "DELETE" });
    if (!res.ok) toast.error("No se pudo eliminar la lista");
  };

  const submitNewList = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newListTitle.trim();
    setNewListTitle("");
    setAddingList(false);
    if (!title) return;
    const res = await fetch(`/api/boards/${board.id}/lists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) toast.error("No se pudo crear la lista");
  };

  const handleUpdateCard = async (cardId: string, patch: Partial<Pick<CardModel, "title" | "description" | "dueDate">>) => {
    const res = await fetch(`/api/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) toast.error("No se pudo guardar el cambio");
  };

  const handleDeleteCard = async (cardId: string) => {
    const res = await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
    if (!res.ok) toast.error("No se pudo eliminar la tarjeta");
  };

  const presenceUsers = Object.values(presence).filter((u) => u.id !== currentUser.id);

  return (
    <div className="relative flex min-h-full flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72"
        style={{ background: `radial-gradient(ellipse at 15% 0%, ${board.color}26, transparent 65%)` }}
      />

      <div className="sticky top-0 z-20 border-b border-border bg-background/75 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <Link href="/boards" className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-ink-faint transition-colors hover:text-ink">
              <ArrowLeft className="h-3 w-3" /> Tableros
            </Link>
            <div className="flex items-center gap-2.5">
              <motion.span
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: board.color }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
              <h1 className="font-display truncate text-xl font-bold tracking-tight sm:text-2xl">{board.title}</h1>
            </div>
            {board.description && <p className="mt-1 max-w-xl truncate text-sm text-ink-dim">{board.description}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar tarjetas"
                aria-label="Buscar tarjetas"
                className="h-9 w-40 rounded-xl border border-border bg-surface pl-9 pr-8 text-sm text-ink outline-none transition-all placeholder:text-ink-faint focus:w-56 focus:border-brand-500 sm:w-44"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Limpiar búsqueda" className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-ink-faint hover:text-ink">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <PresenceBar users={presenceUsers} />
            <div className="flex -space-x-2">
              <Avatar name={board.owner.name} color={board.owner.avatarColor} size={28} ring />
              {members.map((m) => (
                <Avatar key={m.id} name={m.user.name} color={m.user.avatarColor} size={28} ring />
              ))}
            </div>
            <InviteMemberModal boardId={board.id} onInvited={(member) => setMembers((prev) => [...prev, member])} />
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-x-auto px-4 py-6 sm:px-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex items-start gap-4">
            {lists
              .slice()
              .sort((a, b) => a.position - b.position)
              .map((list) => (
                <ListColumn
                  key={list.id}
                  list={list}
                  onCardClick={setSelectedCard}
                  onAddCard={handleAddCard}
                  onDeleteList={handleDeleteList}
                  query={query}
                  accent={LIST_ACCENTS[list.position % LIST_ACCENTS.length]}
                />
              ))}

            <div className="w-72 flex-shrink-0">
              {addingList ? (
                <form onSubmit={submitNewList} className="rounded-2xl bg-surface-alt p-3">
                  <input
                    autoFocus
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Escape" && setAddingList(false)}
                    placeholder="Título de la lista..."
                    className="input-base text-sm"
                  />
                  <div className="mt-1.5 flex items-center gap-2">
                    <button type="submit" className="btn-primary !py-1.5 !px-3 text-xs">
                      Agregar lista
                    </button>
                    <button type="button" onClick={() => setAddingList(false)} className="btn-ghost !p-1.5" aria-label="Cancelar">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingList(true)}
                  className="flex w-full items-center gap-1.5 rounded-2xl bg-surface-alt/60 px-3 py-2.5 text-sm font-semibold text-ink-dim hover:bg-surface-alt cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Agregar lista
                </button>
              )}
            </div>
          </div>

          <DragOverlay>{activeCard ? <CardItem card={activeCard} dragging /> : null}</DragOverlay>
        </DndContext>
      </div>

      <CardDetailModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
        onUpdate={handleUpdateCard}
        onDelete={handleDeleteCard}
      />
    </div>
  );
}

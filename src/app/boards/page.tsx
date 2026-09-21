"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Layers, Users } from "lucide-react";
import CreateBoardModal from "@/components/CreateBoardModal";
import TiltWrapper from "@/components/TiltWrapper";
import type { BoardSummary } from "@/types/models";

export default function BoardsPage() {
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    fetch("/api/boards").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        if (!ignore) setBoards(data.boards);
      }
      if (!ignore) setLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tus tableros</h1>
          <p className="mt-1 text-sm text-ink-dim">Elige un tablero o crea uno nuevo para tu equipo.</p>
        </div>
        <CreateBoardModal onCreated={() => setReloadKey((k) => k + 1)} />
      </div>

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-surface-alt" />
          ))}
        </div>
      ) : boards.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
            <Layers className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm font-semibold">Aún no tienes tableros</p>
          <p className="mt-1 max-w-xs text-sm text-ink-dim">Crea tu primer tablero para empezar a organizar tareas con tu equipo.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board, i) => (
            <motion.div
              key={board.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/boards/${board.id}`} className="block h-full">
                <TiltWrapper className="card-surface h-full p-5 hover:shadow-md">
                  <span className="inline-block h-2 w-10 rounded-full" style={{ backgroundColor: board.color }} />
                  <h3 className="mt-3 text-sm font-bold">{board.title}</h3>
                  {board.description && <p className="mt-1 line-clamp-2 text-xs text-ink-dim">{board.description}</p>}
                  <div className="mt-4 flex items-center gap-4 text-xs text-ink-faint">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" /> {board._count.lists} listas
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {board._count.members + 1} miembros
                    </span>
                  </div>
                </TiltWrapper>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

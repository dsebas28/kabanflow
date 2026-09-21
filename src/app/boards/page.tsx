"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Layers, LayoutDashboard, StickyNote } from "lucide-react";
import Avatar from "@/components/Avatar";
import CreateBoardModal from "@/components/CreateBoardModal";
import TiltWrapper from "@/components/TiltWrapper";
import AnimatedCounter from "@/components/app/AnimatedCounter";
import { useUser } from "@/context/UserContext";
import { EASE_OUT, fadeUp, stagger } from "@/lib/motion";
import type { BoardSummary } from "@/types/models";

function StatTile({
  icon: Icon,
  label,
  value,
  suffix,
  tone,
}: {
  icon: typeof Layers;
  label: string;
  value: number;
  suffix?: string;
  tone: string;
}) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -3 }} className="card-surface flex items-center gap-4 p-4 sm:p-5">
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${tone}1f`, color: tone }}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-display text-2xl font-bold leading-none">
          <AnimatedCounter value={value} suffix={suffix} />
        </p>
        <p className="mt-1 text-xs text-ink-dim">{label}</p>
      </div>
    </motion.div>
  );
}

function BoardCard({ board, index }: { board: BoardSummary; index: number }) {
  const pct = board.cardCount ? Math.round((board.doneCount / board.cardCount) * 100) : 0;
  const people = [board.owner, ...board.members.map((m) => m.user)];

  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }} whileTap={{ scale: 0.985 }} className="h-full">
      <Link href={`/boards/${board.id}`} className="block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">
        <TiltWrapper className="card-surface flex h-full flex-col overflow-hidden transition-shadow hover:shadow-xl">
          <div
            className="relative h-20 flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${board.color}, ${board.color}88)` }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.35)_1px,transparent_0)] [background-size:14px_14px] opacity-60" />
            <motion.div
              aria-hidden="true"
              className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/20 blur-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="flex flex-1 flex-col p-5">
            <h3 className="font-display text-base font-bold leading-snug">{board.title}</h3>
            <p className="mt-1 line-clamp-2 min-h-[2rem] text-xs leading-relaxed text-ink-dim">
              {board.description || "Sin descripción todavía."}
            </p>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-ink-dim">
                  {board.cardCount === 0 ? "Sin tarjetas aún" : `${board.doneCount} de ${board.cardCount} tarjetas hechas`}
                </span>
                <span className="font-semibold tabular-nums">{pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-alt">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: board.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, delay: 0.25 + index * 0.05, ease: EASE_OUT }}
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="flex -space-x-2">
                {people.slice(0, 4).map((p) => (
                  <Avatar key={p.id} name={p.name} color={p.avatarColor} size={26} ring />
                ))}
                {board._count.members + 1 > 4 && (
                  <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-surface-alt text-[10px] font-bold text-ink-dim ring-2 ring-surface">
                    +{board._count.members + 1 - 4}
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 text-xs text-ink-faint">
                <Layers className="h-3.5 w-3.5" /> {board._count.lists} listas
              </span>
            </div>
          </div>
        </TiltWrapper>
      </Link>
    </motion.div>
  );
}

function EmptyState({ onCreated }: { onCreated: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-border px-6 py-16 text-center">
      <div className="relative mb-8 h-24 w-40">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 h-14 w-28 rounded-xl border border-border bg-surface shadow-md"
            style={{ x: "-50%", top: i * 14, zIndex: 3 - i }}
            animate={{ y: [0, -5, 0], rotate: [i * 3 - 3, i * 3 - 1, i * 3 - 3] }}
            transition={{ duration: 3.5, delay: i * 0.3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="m-2.5 h-1.5 w-12 rounded-full bg-brand-500/50" />
            <div className="mx-2.5 h-1.5 w-16 rounded-full bg-border" />
          </motion.div>
        ))}
      </div>
      <h2 className="font-display text-xl font-bold">Aquí vivirá tu primer tablero</h2>
      <p className="mt-2 max-w-sm text-sm text-ink-dim">
        Crea un tablero, añade listas como Por hacer y Hecho, e invita a tu equipo para verlos trabajar en vivo.
      </p>
      <div className="mt-6">
        <CreateBoardModal onCreated={onCreated} />
      </div>
    </motion.div>
  );
}

export default function BoardsPage() {
  const user = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const openNew = searchParams.get("new") === "1";

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

  const totalCards = boards.reduce((s, b) => s + b.cardCount, 0);
  const totalDone = boards.reduce((s, b) => s + b.doneCount, 0);
  const completion = totalCards ? Math.round((totalDone / totalCards) * 100) : 0;
  const firstName = user.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="font-display text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Hola, {firstName}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-1.5 text-ink-dim"
          >
            {boards.length > 0 ? "Esto es lo que tienes en marcha." : "Empieza creando tu primer tablero."}
          </motion.p>
        </div>
        {boards.length > 0 && <CreateBoardModal key={`b-${openNew}`} defaultOpen={openNew} onClose={() => openNew && router.replace("/boards")} onCreated={() => setReloadKey((k) => k + 1)} />}
      </div>

      {!loading && boards.length > 0 && (
        <motion.div variants={stagger(0.08, 0.1)} initial="hidden" animate="show" className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
          <StatTile icon={LayoutDashboard} label="Tableros" value={boards.length} tone="#7c3aed" />
          <StatTile icon={StickyNote} label="Tarjetas en total" value={totalCards} tone="#f59e0b" />
          <StatTile icon={CheckCircle2} label="Completado" value={completion} suffix="%" tone="#14b8a6" />
        </motion.div>
      )}

      {loading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-surface h-[290px] overflow-hidden">
              <div className="skeleton h-20" />
              <div className="space-y-3 p-5">
                <div className="skeleton h-4 w-2/3 rounded" />
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton mt-6 h-1.5 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : boards.length === 0 ? (
        <EmptyState onCreated={() => setReloadKey((k) => k + 1)} />
      ) : (
        <motion.div variants={stagger(0.07, 0.25)} initial="hidden" animate="show" className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board, i) => (
            <BoardCard key={board.id} board={board} index={i} />
          ))}
          <motion.div variants={fadeUp}>
            <CreateBoardModal variant="card" onCreated={() => setReloadKey((k) => k + 1)} />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

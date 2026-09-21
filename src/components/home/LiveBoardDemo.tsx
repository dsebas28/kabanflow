"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Avatar from "@/components/Avatar";

type ColId = "todo" | "doing" | "done";
type Board = Record<ColId, string[]>;
type Person = "Ana" | "Tú";

const COLUMNS: { id: ColId; title: string; dot: string }[] = [
  { id: "todo", title: "Por hacer", dot: "#94a3b8" },
  { id: "doing", title: "En progreso", dot: "#7c3aed" },
  { id: "done", title: "Hecho", dot: "#14b8a6" },
];

const CARDS: Record<string, string> = {
  a: "Diseñar wireframes",
  b: "Configurar analítica",
  c: "Maquetar la landing",
  d: "Revisar accesibilidad",
  e: "Publicar versión 1.0",
};

const INITIAL: Board = { todo: ["a", "b", "c", "d"], doing: ["e"], done: [] };

const SCRIPT: { who: Person; card: string; to: ColId }[] = [
  { who: "Ana", card: "e", to: "done" },
  { who: "Tú", card: "a", to: "doing" },
  { who: "Ana", card: "b", to: "doing" },
  { who: "Tú", card: "a", to: "done" },
  { who: "Ana", card: "c", to: "doing" },
];

const IDLE_HINT = "Haz clic en una tarjeta para moverla tú";
const NEXT_COL: Record<ColId, ColId> = { todo: "doing", doing: "done", done: "todo" };

const WHO_COLOR: Record<Person, string> = { Ana: "#14b8a6", Tú: "#7c3aed" };

type CursorState = { x: number; y: number; who: Person; grab: boolean; visible: boolean };

function moveCard(board: Board, id: string, to: ColId): Board {
  const next: Board = { todo: [], doing: [], done: [] };
  (Object.keys(board) as ColId[]).forEach((col) => {
    next[col] = board[col].filter((c) => c !== id);
  });
  next[to] = [...next[to], id];
  return next;
}

/**
 * A scripted mini-board that plays itself: two named cursors pick cards up
 * and drop them into other columns while an activity line reports each move —
 * the same thing that happens between real collaborators, in miniature.
 */
export default function LiveBoardDemo() {
  const reduceMotion = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [board, setBoard] = useState<Board>(INITIAL);
  const [activity, setActivity] = useState(IDLE_HINT);
  const [grabbed, setGrabbed] = useState<string | null>(null);
  const [cursor, setCursor] = useState<CursorState>({ x: 0, y: 0, who: "Ana", grab: false, visible: false });

  useEffect(() => {
    if (reduceMotion) return;
    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const pointAt = (el: Element, fx: number, fy: number) => {
      const c = box.current!.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { x: r.left - c.left + r.width * fx, y: r.top - c.top + r.height * fy };
    };

    (async () => {
      await sleep(1600);
      while (!cancelled) {
        for (const step of SCRIPT) {
          while (pausedRef.current && !cancelled) await sleep(250);
          if (cancelled || !box.current) return;
          const cardEl = box.current.querySelector(`[data-card="${step.card}"]`);
          const colEl = box.current.querySelector(`[data-col="${step.to}"]`);
          if (!cardEl || !colEl) continue;

          setCursor((c) => ({ ...c, ...pointAt(cardEl, 0.72, 0.6), who: step.who, grab: false, visible: true }));
          await sleep(1000);
          if (cancelled) return;
          setGrabbed(step.card);
          setCursor((c) => ({ ...c, grab: true }));
          await sleep(280);
          if (cancelled || !box.current) return;

          setCursor((c) => ({ ...c, ...pointAt(colEl, 0.6, 0.4) }));
          await sleep(850);
          if (cancelled) return;

          setBoard((b) => moveCard(b, step.card, step.to));
          setGrabbed(null);
          setCursor((c) => ({ ...c, grab: false }));
          const colTitle = COLUMNS.find((c) => c.id === step.to)!.title;
          setActivity(`${step.who === "Tú" ? "Tú moviste" : "Ana movió"} «${CARDS[step.card]}» a ${colTitle}`);
          await sleep(1500);
        }
        await sleep(1800);
        if (cancelled) return;
        setCursor((c) => ({ ...c, visible: false }));
        setBoard(INITIAL);
        setActivity(IDLE_HINT);
        await sleep(1600);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reduceMotion]);

  const pause = () => {
    pausedRef.current = true;
    setCursor((c) => ({ ...c, visible: false, grab: false }));
    setGrabbed(null);
  };
  const resume = () => {
    pausedRef.current = false;
  };
  const advance = (id: string) => {
    const from = (Object.keys(board) as ColId[]).find((col) => board[col].includes(id));
    if (!from) return;
    const to = NEXT_COL[from];
    setBoard((b) => moveCard(b, id, to));
    setActivity(`Tú moviste «${CARDS[id]}» a ${COLUMNS.find((c) => c.id === to)!.title}`);
  };

  return (
    <div className="w-full">
      <div
        ref={box}
        onPointerEnter={pause}
        onPointerLeave={resume}
        className="card-surface relative overflow-hidden p-4 shadow-2xl sm:p-5"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
            <span className="font-display text-sm font-bold">Lanzamiento de producto</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <Avatar name="Ana Torres" color="#14b8a6" size={24} ring />
              <Avatar name="Cuenta Demo" color="#7c3aed" size={24} ring />
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-accent-500/10 px-2 py-0.5 text-[10px] font-semibold text-accent-600 dark:text-accent-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-500" />
              En vivo
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
          {COLUMNS.map((col) => (
            <div key={col.id} data-col={col.id} className="min-h-[250px] rounded-xl bg-surface-alt p-2 sm:p-2.5">
              <div className="mb-2 flex items-center gap-1.5 px-0.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: col.dot }} />
                <span className="text-[11px] font-bold text-ink-dim">{col.title}</span>
                <span className="text-[10px] text-ink-faint">{board[col.id].length}</span>
              </div>
              <div className="space-y-2">
                {board[col.id].map((id) => (
                  <motion.div
                    key={id}
                    layout
                    layoutId={`demo-${id}`}
                    data-card={id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Mover «${CARDS[id]}» a la siguiente columna`}
                    onClick={() => advance(id)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), advance(id))}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className={`cursor-pointer rounded-lg border bg-surface p-2 text-[11px] font-medium leading-snug text-ink sm:p-2.5 ${
                      grabbed === id ? "border-brand-500 shadow-lg shadow-brand-500/25" : "border-border shadow-sm"
                    }`}
                  >
                    {CARDS[id]}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-20"
          initial={false}
          animate={{ x: cursor.x, y: cursor.y, opacity: cursor.visible ? 1 : 0, scale: cursor.grab ? 0.88 : 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 20, opacity: { duration: 0.25 } }}
        >
          <svg width="18" height="22" viewBox="0 0 14 20" className="drop-shadow-md">
            <path d="M0 0 L0 16 L4.5 12 L7.5 19 L10 18 L7 11 L13 11 Z" fill={WHO_COLOR[cursor.who]} stroke="#fff" strokeWidth="1" />
          </svg>
          <span
            className="ml-3.5 -mt-1 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white shadow"
            style={{ backgroundColor: WHO_COLOR[cursor.who] }}
          >
            {cursor.who}
          </span>
        </motion.div>
      </div>

      <div className="mt-3 h-5 overflow-hidden text-center text-xs text-ink-dim" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={activity}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {activity}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

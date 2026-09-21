"use client";

import { motion } from "framer-motion";
import Avatar from "@/components/Avatar";

const COLUMNS = [
  {
    title: "Por hacer",
    color: "#94a3b8",
    cards: ["Definir alcance del MVP", "Diseñar wireframes"],
  },
  {
    title: "En progreso",
    color: "#7c3aed",
    cards: ["Maquetar landing page", "Integrar autenticación"],
  },
  {
    title: "Hecho",
    color: "#14b8a6",
    cards: ["Investigación de mercado"],
  },
];

export default function LandingBoardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card-surface relative overflow-hidden p-4 shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
          <span className="text-sm font-bold">Lanzamiento de producto</span>
        </div>
        <div className="flex -space-x-2">
          <Avatar name="Cuenta Demo" color="#7c3aed" size={24} ring />
          <Avatar name="Ana Torres" color="#14b8a6" size={24} ring />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {COLUMNS.map((col, colIndex) => (
          <div key={col.title} className="rounded-xl bg-surface-alt p-2.5">
            <div className="mb-2 flex items-center gap-1.5 px-0.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: col.color }} />
              <span className="text-[11px] font-bold text-ink-dim">{col.title}</span>
            </div>
            <div className="space-y-2">
              {col.cards.map((card, cardIndex) => (
                <motion.div
                  key={card}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + colIndex * 0.1 + cardIndex * 0.06, duration: 0.4 }}
                  className="rounded-lg border border-border bg-surface p-2.5 text-[11px] font-medium leading-snug text-ink shadow-sm"
                >
                  {card}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <motion.div
        aria-hidden="true"
        className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-accent-500/20 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

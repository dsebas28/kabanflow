"use client";

import { motion, useReducedMotion } from "framer-motion";
import Avatar from "@/components/Avatar";

const PEOPLE = [
  { name: "Ana Torres", color: "#b3261e" },
  { name: "Cuenta Demo", color: "#1a1814" },
  { name: "Luis Mora", color: "#8c6d1f" },
];

export default function PresenceDots() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="flex items-center gap-3 text-sm text-ink-dim">
      <div className="flex -space-x-2">
        {PEOPLE.map((p, i) => (
          <motion.div
            key={p.name}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: [0, -4, 0] }}
            transition={{
              opacity: { delay: 0.9 + i * 0.12 },
              y: { delay: 1 + i * 0.4, duration: 3.2, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <Avatar name={p.name} color={p.color} size={32} ring />
          </motion.div>
        ))}
      </div>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--mark)] opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--mark)]" />
      </span>
      <span>Tu equipo ya está en el tablero</span>
    </div>
  );
}

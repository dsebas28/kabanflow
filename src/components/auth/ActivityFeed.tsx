"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Avatar from "@/components/Avatar";

const EVENTS = [
  { who: "Ana Torres", color: "#14b8a6", text: "movió «Diseñar wireframes» a En progreso" },
  { who: "Luis Mora", color: "#f59e0b", text: "comentó en «Configurar analítica»" },
  { who: "Cuenta Demo", color: "#7c3aed", text: "creó la tarjeta «Revisar accesibilidad»" },
  { who: "Ana Torres", color: "#14b8a6", text: "movió «Publicar versión 1.0» a Hecho" },
  { who: "Luis Mora", color: "#f59e0b", text: "fijó fecha límite en «Maquetar la landing»" },
];

const VISIBLE = 3;

/** Rolling list of team activity, newest on top, as it would look inside a board. */
export default function ActivityFeed() {
  const reduceMotion = useReducedMotion();
  const [tick, setTick] = useState(VISIBLE);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setTick((t) => t + 1), 3200);
    return () => clearInterval(id);
  }, [reduceMotion]);

  const items = Array.from({ length: VISIBLE }, (_, i) => {
    const n = tick - i;
    return { n, ...EVENTS[n % EVENTS.length] };
  });

  return (
    <div className="space-y-2.5" aria-label="Actividad reciente del equipo">
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item, i) => (
          <motion.div
            key={item.n}
            layout
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1 - i * 0.28, y: 0, scale: 1 - i * 0.02 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.07] px-3.5 py-3 backdrop-blur-md"
          >
            <Avatar name={item.who} color={item.color} size={28} />
            <p className="min-w-0 text-[13px] leading-snug text-white/85">
              <span className="font-semibold text-white">{item.who}</span> {item.text}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

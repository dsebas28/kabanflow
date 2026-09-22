"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

const QUESTIONS = [
  {
    q: "¿Necesito crear una cuenta para probarlo?",
    a: "No. El botón «Probar con la cuenta demo» te mete directo a un tablero de ejemplo. Si quieres tus propios tableros, crear una cuenta toma menos de un minuto.",
  },
  {
    q: "¿Cómo se ven los cambios al instante?",
    a: "Cada tablero abre una conexión WebSocket con el servidor. Cuando alguien mueve, crea o edita una tarjeta, el servidor avisa a todos los que tienen ese tablero abierto y su pantalla se actualiza sola.",
  },
  {
    q: "¿Puedo trabajar con otras personas en el mismo tablero?",
    a: "Sí. Desde el tablero pulsa «Invitar» y escribe el correo de una persona que ya tenga cuenta. Entrará al tablero al momento y verás su avatar cuando esté conectada.",
  },
  {
    q: "¿Funciona en el celular?",
    a: "Sí. La barra lateral se convierte en un menú, las columnas se desplazan de lado y arrastrar tarjetas funciona con el dedo.",
  },
  {
    q: "¿Qué tecnologías usa?",
    a: "Next.js con TypeScript, Prisma sobre PostgreSQL, Auth.js para las sesiones, Socket.io para el tiempo real, dnd-kit para arrastrar y Framer Motion para las animaciones.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border border-y border-border">
      {QUESTIONS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="group flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left"
            >
              <span className="font-serif-ed text-lg font-semibold tracking-tight transition-colors group-hover:text-[var(--mark)]">
                {item.q}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 26 }}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border text-ink-dim"
              >
                <Plus className="h-4 w-4" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 leading-relaxed text-ink-dim">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

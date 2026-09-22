"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

const STEPS = [
  {
    title: "Crea un tablero",
    body: "Empieza con Por hacer, En progreso y Hecho, o arma tus propias listas.",
  },
  {
    title: "Invita a tu equipo",
    body: "Escribe su correo. Si ya tienen cuenta, entran al tablero al momento.",
  },
  {
    title: "Muévanse juntos",
    body: "Arrastra tarjetas, comenta y fija fechas. Todos ven cada cambio sin recargar.",
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 65%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-[1fr_1.2fr]">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <h2 className="font-serif-ed text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Del primer tablero al equipo completo en tres pasos.
        </h2>
        <p className="mt-4 max-w-sm text-ink-dim">Sin configuración previa: creas, invitas y empiezan a trabajar.</p>
      </div>

      <div ref={ref} className="relative pl-12">
        <div className="absolute bottom-2 left-[15px] top-2 w-px bg-border" />
        <motion.div className="absolute bottom-2 left-[14px] top-2 w-0.5 origin-top bg-[var(--mark)]" style={{ scaleY: fill }} />

        <ol className="space-y-24">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.title}
              className="relative"
              initial={{ opacity: 0.25, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ margin: "-38% 0px -38% 0px" }}
              transition={{ duration: 0.5 }}
            >
              <span className="absolute -left-12 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-ink bg-surface text-xs font-semibold text-ink">
                {i + 1}
              </span>
              <h3 className="font-serif-ed text-2xl font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 max-w-md text-ink-dim">{step.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Lock, Moon, Sun } from "lucide-react";
import Avatar from "@/components/Avatar";
import { useTheme } from "@/hooks/useTheme";
import { fadeUp, stagger, VP_ONCE } from "@/lib/motion";

function Tile({ title, body, children, className = "" }: { title: string; body: string; children: ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeUp} className={`card-surface flex flex-col overflow-hidden ${className}`}>
      <div className="flex flex-1 items-center justify-center bg-surface-alt/60 p-6">{children}</div>
      <div className="p-6">
        <h3 className="font-display text-lg font-bold tracking-tight">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{body}</p>
      </div>
    </motion.div>
  );
}

function MiniBoard({ name, color, delay }: { name: string; color: string; delay: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="w-full max-w-[260px] rounded-xl border border-border bg-surface p-2.5 shadow-sm">
      <div className="mb-2 flex items-center gap-1.5">
        <Avatar name={name} color={color} size={16} />
        <span className="text-[10px] font-semibold text-ink-dim">{name}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-14 rounded-lg bg-surface-alt p-1.5">
          <motion.div
            className="h-5 rounded-md bg-brand-500"
            animate={reduceMotion ? undefined : { x: [0, 0, 108, 108, 0], opacity: [1, 1, 1, 1, 1] }}
            transition={{ duration: 5, times: [0, 0.25, 0.42, 0.85, 1], repeat: Infinity, delay, ease: "easeInOut" }}
          />
        </div>
        <div className="h-14 rounded-lg bg-surface-alt" />
      </div>
    </div>
  );
}

function SyncVisual() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="flex w-full flex-col items-center">
      <MiniBoard name="Ana" color="#14b8a6" delay={0} />
      <div className="relative my-1 h-10 w-px bg-border">
        {!reduceMotion && (
          <motion.span
            className="absolute -left-[3px] h-2 w-2 rounded-full bg-accent-500"
            animate={{ y: [0, 34], opacity: [0, 1, 0] }}
            transition={{ duration: 1.1, delay: 1.2, repeat: Infinity, repeatDelay: 3.9, ease: "easeIn" }}
          />
        )}
      </div>
      <MiniBoard name="Tú" color="#7c3aed" delay={0.55} />
    </div>
  );
}

function DragVisual() {
  return (
    <div className="flex h-28 w-full items-center justify-center rounded-xl border-2 border-dashed border-border">
      <motion.div
        drag
        dragSnapToOrigin
        dragElastic={0.25}
        whileHover={{ scale: 1.04 }}
        whileDrag={{ scale: 1.08, rotate: 3, boxShadow: "0 20px 40px -12px rgba(124,58,237,0.45)" }}
        className="cursor-grab select-none rounded-xl border border-border bg-surface px-4 py-3 text-xs font-semibold shadow-md active:cursor-grabbing"
      >
        Arrástrame
      </motion.div>
    </div>
  );
}

const TEAM = [
  { name: "Ana Torres", color: "#14b8a6" },
  { name: "Luis Mora", color: "#f59e0b" },
  { name: "Cuenta Demo", color: "#7c3aed" },
  { name: "Sara Gil", color: "#ec4899" },
  { name: "Leo Paz", color: "#0ea5e9" },
];

function TeamVisual() {
  return (
    <div className="flex -space-x-3 transition-all duration-300 hover:space-x-1 [&>*]:transition-[margin] [&>*]:duration-300">
      {TEAM.map((p, i) => (
        <motion.div key={p.name} whileHover={{ y: -6, zIndex: 10 }} className="relative" style={{ zIndex: TEAM.length - i }}>
          <Avatar name={p.name} color={p.color} size={44} ring />
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface bg-accent-500" />
        </motion.div>
      ))}
    </div>
  );
}

function CommentVisual() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="w-full max-w-[250px] space-y-2.5">
      <div className="rounded-xl rounded-bl-sm border border-border bg-surface p-3 text-xs leading-snug shadow-sm">
        <span className="font-semibold">Ana:</span> Ya subí los wireframes, ¿los revisamos hoy?
      </div>
      <div className="ml-auto flex w-fit items-center gap-1 rounded-xl rounded-br-sm bg-brand-500 px-3.5 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-white"
            animate={reduceMotion ? undefined : { y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.9, delay: i * 0.15, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  );
}

function ThemeVisual() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={dark}
      aria-label="Cambiar entre modo claro y oscuro"
      className="relative flex h-12 w-24 cursor-pointer items-center rounded-full border border-border bg-surface p-1.5 shadow-inner"
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={`flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md ${dark ? "ml-auto bg-brand-600" : "bg-amber-400"}`}
      >
        <motion.span key={String(dark)} initial={{ rotate: -90, scale: 0.5 }} animate={{ rotate: 0, scale: 1 }}>
          {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </motion.span>
      </motion.span>
    </button>
  );
}

function LockVisual() {
  return (
    <motion.div whileHover="hover" className="flex flex-col items-center gap-3">
      <motion.span
        variants={{ hover: { rotate: [0, -8, 8, 0], scale: 1.1 } }}
        transition={{ duration: 0.5 }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500/15 text-accent-600 dark:text-accent-400"
      >
        <Lock className="h-6 w-6" />
      </motion.span>
      <span className="rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs tracking-widest text-ink-dim">••••••••</span>
    </motion.div>
  );
}

export default function BentoFeatures() {
  return (
    <motion.div
      variants={stagger(0.08)}
      initial="hidden"
      whileInView="show"
      viewport={VP_ONCE}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      <Tile
        className="lg:row-span-2"
        title="Cambios al instante"
        body="Lo que hace una persona aparece en la pantalla de la otra sin recargar. Mira cómo la tarjeta de Ana se repite en el tablero de abajo."
      >
        <SyncVisual />
      </Tile>
      <Tile title="Arrastra y suelta" body="Mueve tarjetas entre listas con mouse, dedo o teclado. Pruébalo: arrastra la tarjeta.">
        <DragVisual />
      </Tile>
      <Tile title="Trabajo en equipo" body="Invita por correo y mira quién está conectado en cada momento.">
        <TeamVisual />
      </Tile>
      <Tile title="Comentarios y fechas" body="Conversa dentro de cada tarjeta y fija una fecha límite para no perder el hilo.">
        <CommentVisual />
      </Tile>
      <Tile title="Claro u oscuro" body="Cambia el tema cuando quieras; se recuerda en tu próxima visita. Este interruptor es real.">
        <ThemeVisual />
      </Tile>
      <Tile title="Tu cuenta, protegida" body="Las contraseñas se guardan cifradas y cada tablero es privado para quienes invitas.">
        <LockVisual />
      </Tile>
    </motion.div>
  );
}

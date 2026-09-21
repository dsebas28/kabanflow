"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowRight, MousePointerClick, Radio, ShieldCheck, Users2 } from "lucide-react";
import GithubMark from "@/components/GithubMark";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import HeroVisual from "@/components/HeroVisual";
import { fadeUp, scaleIn, stagger, VP_ONCE } from "@/lib/motion";

const FEATURES = [
  {
    icon: MousePointerClick,
    title: "Arrastra y suelta",
    body: "Reorganiza tarjetas entre listas con una interacción fluida, construida con dnd-kit.",
  },
  {
    icon: Radio,
    title: "Tiempo real",
    body: "Cada cambio se transmite al instante a todos los que tengan el tablero abierto, vía WebSockets.",
  },
  {
    icon: Users2,
    title: "Colaboración",
    body: "Invita compañeros por correo y trabajen juntos en el mismo tablero, viendo quién está activo.",
  },
  {
    icon: ShieldCheck,
    title: "Cuentas reales",
    body: "Registro y login con contraseñas cifradas — o prueba todo al instante con la cuenta demo.",
  },
];

export default function LandingPage() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 80));

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300 ${
          scrolled ? "bg-surface border-border" : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="btn-ghost">
              Iniciar sesión
            </Link>
            <Link href="/register" className="btn-primary">
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative mx-auto grid max-w-6xl gap-12 overflow-hidden px-6 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger(0.1)}
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-ink-dim"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-500" />
              Proyecto open source
            </motion.div>
            <motion.h1 variants={fadeUp} className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
              Tableros Kanban que se <span className="text-brand-500">actualizan en vivo</span>.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-5 max-w-md text-base leading-relaxed text-ink-dim">
              Organiza proyectos con tu equipo en tableros con arrastrar y soltar, sincronizados
              al instante con WebSockets — sin recargar la página, sin conflictos.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/login?demo=1" className="btn-primary">
                Probar como invitado <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/register" className="btn-secondary">
                Crear cuenta gratis
              </Link>
            </motion.div>
            <motion.a
              variants={fadeUp}
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink-dim hover:text-ink"
            >
              <GithubMark className="h-4 w-4" /> Ver el código en GitHub
            </motion.a>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <HeroVisual />
          </motion.div>
        </section>

        <section className="border-t border-border bg-surface-alt/60">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <motion.h2
              initial="hidden"
              whileInView="show"
              viewport={VP_ONCE}
              variants={fadeUp}
              className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Todo lo que necesitas para coordinar un equipo
            </motion.h2>
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={VP_ONCE}
              variants={stagger(0.08)}
              className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            >
              {FEATURES.map((f) => (
                <motion.div
                  key={f.title}
                  variants={scaleIn}
                  whileHover={{ y: -4 }}
                  className="card-surface p-5 transition-shadow hover:shadow-lg"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-dim">{f.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-xs text-ink-faint sm:flex-row">
          <span>KanbanFlow — proyecto de portafolio construido con Next.js, Prisma y Socket.io</span>
          <Logo size={20} />
        </div>
      </footer>
    </div>
  );
}

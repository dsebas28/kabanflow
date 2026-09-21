"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { MousePointerClick, Radio, ShieldCheck, Users2 } from "lucide-react";
import GithubMark from "@/components/GithubMark";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import WordReveal from "@/components/WordReveal";
import CursorGlow from "@/components/home/CursorGlow";
import HeroBackdrop from "@/components/home/HeroBackdrop";
import HowItWorks from "@/components/home/HowItWorks";
import LiveBoardDemo from "@/components/home/LiveBoardDemo";
import TechMarquee from "@/components/home/TechMarquee";
import { EASE_OUT } from "@/lib/motion";

const REPO_URL = "https://github.com/dsebas28/kabanflow";

const FEATURES = [
  {
    icon: MousePointerClick,
    title: "Arrastra y suelta",
    body: "Mueve tarjetas entre listas o reordénalas dentro de la misma. Funciona con mouse, táctil y teclado.",
  },
  {
    icon: Radio,
    title: "Cambios al instante",
    body: "Cada movimiento, comentario o edición llega a todos los que tienen el tablero abierto, sin recargar.",
  },
  {
    icon: Users2,
    title: "Trabajo en equipo",
    body: "Invita por correo y mira quién está conectado en ese momento.",
  },
  {
    icon: ShieldCheck,
    title: "Tus datos, tu cuenta",
    body: "Contraseñas cifradas y tableros privados. Si solo quieres mirar, entra con la cuenta demo.",
  },
];

export default function LandingPage() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 80));

  return (
    <div className="relative flex min-h-screen flex-col">
      <CursorGlow />

      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300 ${
          scrolled ? "border-border bg-surface/85" : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn-ghost hidden sm:inline-flex" aria-label="Código en GitHub">
              <GithubMark className="h-4 w-4" /> Código
            </a>
            <Link href="/login" className="btn-ghost">
              Iniciar sesión
            </Link>
            <Link href="/register" className="btn-primary">
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        <section className="relative overflow-hidden">
          <HeroBackdrop />
          <div className="relative mx-auto grid max-w-6xl gap-14 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-28">
            <div>
              <WordReveal
                text="Un tablero que se mueve cuando tu equipo se mueve."
                className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl"
              />
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6, ease: EASE_OUT }}
                className="mt-6 max-w-md text-lg leading-relaxed text-ink-dim"
              >
                Arrastra una tarjeta y todos los que tienen el tablero abierto la ven cambiar de columna al instante.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.6, ease: EASE_OUT }}
                className="mt-9 flex flex-wrap items-center gap-3"
              >
                <Link href="/login?demo=1" className="btn-primary btn-shimmer px-6 py-3">
                  Probar con la cuenta demo
                </Link>
                <Link href="/register" className="btn-secondary px-6 py-3">
                  Crear cuenta
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30, rotateX: 8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.5, duration: 0.9, ease: EASE_OUT }}
              style={{ transformPerspective: 1200 }}
            >
              <LiveBoardDemo />
            </motion.div>
          </div>
        </section>

        <TechMarquee />

        <HowItWorks />

        <section className="border-t border-border bg-surface-alt/50">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <h2 className="font-display max-w-lg text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Lo que pasa cuando abres un tablero
            </h2>
            <ul className="mt-12 border-t border-border">
              {FEATURES.map((f) => (
                <motion.li
                  key={f.title}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6 }}
                  className="group grid gap-3 border-b border-border py-8 sm:grid-cols-[1fr_1.4fr] sm:items-center"
                >
                  <div className="flex items-center gap-4 transition-transform duration-300 group-hover:translate-x-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 transition-colors duration-300 group-hover:bg-brand-500 group-hover:text-white">
                      <f.icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-display text-xl font-bold tracking-tight">{f.title}</h3>
                  </div>
                  <p className="max-w-md text-ink-dim">{f.body}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
            className="relative overflow-hidden rounded-[2rem] bg-brand-950 px-8 py-16 text-center sm:px-16"
          >
            <motion.div
              aria-hidden="true"
              className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-brand-500/40 blur-3xl"
              animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-accent-500/30 blur-3xl"
              animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
              transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative">
              <h2 className="font-display mx-auto max-w-xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                Míralo funcionar antes de crear una cuenta.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-brand-200">
                La cuenta demo trae un tablero con tarjetas. Ábrelo en dos pestañas y mueve una para ver el cambio en la otra.
              </p>
              <Link href="/login?demo=1" className="btn-shimmer mt-8 inline-flex rounded-xl bg-white px-7 py-3 text-sm font-bold text-brand-900 transition-transform hover:scale-[1.03]">
                Entrar con la cuenta demo
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-xs text-ink-faint sm:flex-row">
          <span>Proyecto de portafolio hecho con Next.js, Prisma y Socket.io.</span>
          <Logo size={20} />
        </div>
      </footer>
    </div>
  );
}

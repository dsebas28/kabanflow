"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import GithubMark from "@/components/GithubMark";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import WordReveal from "@/components/WordReveal";
import BentoFeatures from "@/components/home/BentoFeatures";
import CursorGlow from "@/components/home/CursorGlow";
import Faq from "@/components/home/Faq";
import HeroBackdrop from "@/components/home/HeroBackdrop";
import HowItWorks from "@/components/home/HowItWorks";
import LiveBoardDemo from "@/components/home/LiveBoardDemo";
import Magnetic from "@/components/home/Magnetic";
import ScrollProgress from "@/components/home/ScrollProgress";
import TechMarquee from "@/components/home/TechMarquee";
import { EASE_OUT, fadeUp, VP_ONCE } from "@/lib/motion";

const REPO_URL = "https://github.com/dsebas28/kabanflow";

export default function LandingPage() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 80));

  return (
    <div className="relative flex min-h-screen flex-col">
      <ScrollProgress />
      <CursorGlow />

      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-md transition-all duration-300 ${
          scrolled ? "border-border bg-surface/85 py-0" : "border-transparent bg-transparent py-1"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Logo />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn-ghost hidden sm:inline-flex" aria-label="Código en GitHub">
              <GithubMark className="h-4 w-4" /> Código
            </a>
            <Link href="/login" className="btn-ghost">
              Iniciar sesión
            </Link>
            <Link href="/register" className="btn-primary hidden sm:inline-flex">
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        <section className="relative overflow-hidden">
          <HeroBackdrop />
          <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-14 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-28">
            <div>
              <WordReveal
                text="Un tablero que se mueve cuando tu equipo se mueve."
                className="font-display text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl"
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
                <Magnetic>
                  <Link href="/login?demo=1" className="btn-primary btn-shimmer px-6 py-3">
                    Probar con la cuenta demo
                  </Link>
                </Magnetic>
                <Magnetic>
                  <Link href="/register" className="btn-secondary px-6 py-3">
                    Crear cuenta
                  </Link>
                </Magnetic>
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

        <section className="border-t border-border bg-surface-alt/40">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <motion.div initial="hidden" whileInView="show" viewport={VP_ONCE} variants={fadeUp} className="mb-12 max-w-xl">
              <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Todo lo que necesitas, y se puede tocar.
              </h2>
              <p className="mt-3 text-ink-dim">Cada pieza de abajo es interactiva: arrastra, cambia el tema y mira cómo se sincronizan dos pantallas.</p>
            </motion.div>
            <BentoFeatures />
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <motion.div initial="hidden" whileInView="show" viewport={VP_ONCE} variants={fadeUp}>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Preguntas frecuentes</h2>
            <p className="mt-3 max-w-xs text-ink-dim">Lo que suele preguntar la gente antes de abrir su primer tablero.</p>
          </motion.div>
          <Faq />
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
            className="relative overflow-hidden rounded-[2rem] bg-brand-950 px-6 py-16 text-center sm:px-16"
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
              <div className="mt-8">
                <Magnetic>
                  <Link href="/login?demo=1" className="btn-shimmer inline-flex rounded-xl bg-white px-7 py-3 text-sm font-bold text-brand-900 transition-transform hover:scale-[1.03]">
                    Entrar con la cuenta demo
                  </Link>
                </Magnetic>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-ink-faint sm:flex-row sm:px-6">
          <span>Proyecto de portafolio hecho con Next.js, Prisma y Socket.io.</span>
          <Logo size={20} />
        </div>
      </footer>
    </div>
  );
}

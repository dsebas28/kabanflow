"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import GithubMark from "@/components/GithubMark";
import ThemeToggle from "@/components/ThemeToggle";
import WordReveal from "@/components/WordReveal";
import Masthead from "@/components/editorial/Masthead";
import BentoFeatures from "@/components/home/BentoFeatures";
import Faq from "@/components/home/Faq";
import HowItWorks from "@/components/home/HowItWorks";
import LiveBoardDemo from "@/components/home/LiveBoardDemo";
import Magnetic from "@/components/home/Magnetic";
import ScrollProgress from "@/components/home/ScrollProgress";
import TechMarquee from "@/components/home/TechMarquee";
import { EASE_OUT, fadeUp, VP_ONCE } from "@/lib/motion";

const REPO_URL = "https://github.com/dsebas28/kabanflow";
const TODAY = new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

export default function LandingPage() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 60));

  return (
    <div className="editorial relative flex min-h-screen flex-col bg-background text-ink">
      <ScrollProgress />

      <header
        className={`sticky top-0 z-50 bg-background/95 backdrop-blur-sm transition-shadow ${scrolled ? "shadow-[0_1px_0_var(--border)]" : ""}`}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/">
            <Masthead />
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="btn-outline-ed hidden !border-0 !px-2.5 sm:inline-flex" aria-label="Código en GitHub">
              <GithubMark className="h-4 w-4" />
            </a>
            <Link href="/login" className="px-3 py-2 text-sm font-medium text-ink-dim transition-colors hover:text-ink">
              Iniciar sesión
            </Link>
            <Link href="/register" className="btn-outline-ed hidden sm:inline-flex">
              Crear cuenta
            </Link>
          </div>
        </div>
        <div className="border-b border-ink" />
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-5 pb-20 pt-14 sm:px-8 sm:pt-20">
          <p className="font-serif-ed text-sm italic text-ink-faint">Un tablero para equipos pequeños — {TODAY}</p>

          <div className="mt-4 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div className="lg:border-r lg:border-border lg:pr-14">
              <WordReveal
                text="Organiza el trabajo como se ordena una página."
                className="font-serif-ed text-[2.6rem] font-medium leading-[1.05] tracking-tight sm:text-6xl"
              />
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.6, ease: EASE_OUT }}
                className="mt-7 max-w-md text-lg leading-relaxed text-ink-dim"
              >
                Mueve una tarjeta y todos los que tienen el tablero abierto la ven cambiar de lugar al instante — sin
                recargar, sin avisos, sin fricción.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6, ease: EASE_OUT }}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                <Magnetic>
                  <Link href="/login?demo=1" className="btn-mark">
                    Probar con la cuenta demo
                  </Link>
                </Magnetic>
                <Link href="/register" className="text-sm font-semibold text-ink underline decoration-[var(--border)] decoration-2 underline-offset-4 transition-colors hover:decoration-[var(--mark)]">
                  Crear una cuenta
                </Link>
              </motion.div>
            </div>

            <motion.figure
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: EASE_OUT }}
              className="m-0"
            >
              <LiveBoardDemo />
              <figcaption className="mt-3 border-t border-border pt-2 font-serif-ed text-xs italic text-ink-faint">
                Fig. 1 — dos personas moviendo tarjetas en el mismo tablero, en vivo.
              </figcaption>
            </motion.figure>
          </div>
        </section>

        <TechMarquee />

        <HowItWorks />

        <section className="border-t border-border">
          <div className="mx-auto max-w-5xl px-5 py-24 sm:px-8">
            <motion.div initial="hidden" whileInView="show" viewport={VP_ONCE} variants={fadeUp} className="mb-12 max-w-xl">
              <h2 className="font-serif-ed text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
                Todo lo que necesitas, y se puede tocar.
              </h2>
              <p className="mt-3 text-ink-dim">Cada pieza de abajo es interactiva: arrastra, cambia el tema y mira cómo se sincronizan dos pantallas.</p>
            </motion.div>
            <BentoFeatures />
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-12 border-t border-border px-5 py-24 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <motion.div initial="hidden" whileInView="show" viewport={VP_ONCE} variants={fadeUp}>
            <h2 className="font-serif-ed text-3xl font-medium leading-tight tracking-tight sm:text-4xl">Preguntas frecuentes</h2>
            <p className="mt-3 max-w-xs text-ink-dim">Lo que suele preguntar la gente antes de abrir su primer tablero.</p>
          </motion.div>
          <Faq />
        </section>

        <section className="border-t border-border">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-8"
          >
            <h2 className="font-serif-ed mx-auto max-w-xl text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              Míralo funcionar antes de crear una cuenta.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-ink-dim">
              La cuenta demo trae un tablero con tarjetas. Ábrelo en dos pestañas y mueve una para ver el cambio en la otra.
            </p>
            <div className="mt-8">
              <Magnetic>
                <Link href="/login?demo=1" className="btn-mark">
                  Entrar con la cuenta demo
                </Link>
              </Magnetic>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-ink">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-5 py-8 text-xs text-ink-faint sm:flex-row sm:px-8">
          <span>Proyecto de portafolio hecho con Next.js, Prisma y Socket.io.</span>
          <Masthead size={16} />
        </div>
      </footer>
    </div>
  );
}

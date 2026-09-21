import type { ReactNode } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import AuthVisual from "@/components/AuthVisual";
import ThemeToggle from "@/components/ThemeToggle";
import WordReveal from "@/components/WordReveal";
import PresenceDots from "@/components/auth/PresenceDots";
import ActivityFeed from "@/components/auth/ActivityFeed";

/** Split layout shared by login and register: scene on the left, form on the right. */
export default function AuthShell({
  title,
  subtitle,
  panelHeadline,
  children,
}: {
  title: string;
  subtitle: string;
  panelHeadline: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#0b0a17] lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(124,58,237,0.35),transparent_60%),radial-gradient(ellipse_at_80%_90%,rgba(20,184,166,0.22),transparent_55%)]" />
        <AuthVisual />
        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          <Link href="/" className="w-fit text-white">
            <Logo />
          </Link>
          <div className="max-w-md">
            <WordReveal
              as="h2"
              text={panelHeadline}
              delay={0.2}
              className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white"
            />
            <div className="mt-6">
              <PresenceDots />
            </div>
            <div className="mt-10 hidden [@media(min-height:780px)]:block">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </aside>

      <main className="relative flex flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between lg:justify-end">
          <Link href="/" className="lg:hidden">
            <Logo size={28} />
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <WordReveal text={title} className="font-display text-3xl font-bold tracking-tight" />
            <p className="mt-2 text-sm text-ink-dim">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

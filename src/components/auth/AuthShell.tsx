import type { ReactNode } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import AuthVisual from "@/components/AuthVisual";
import ThemeToggle from "@/components/ThemeToggle";
import WordReveal from "@/components/WordReveal";
import Aurora from "@/components/auth/Aurora";
import PresenceDots from "@/components/auth/PresenceDots";
import ActivityFeed from "@/components/auth/ActivityFeed";
import SpotlightCard from "@/components/auth/SpotlightCard";

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
        <Aurora />
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

      <main className="relative flex flex-col px-4 py-4 sm:px-10 sm:py-6">
        <div className="flex items-center justify-between lg:justify-end">
          <Link href="/" className="lg:hidden">
            <Logo size={28} />
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-6 sm:py-10">
          <div className="w-full max-w-sm">
            <div className="relative mb-5 overflow-hidden rounded-2xl bg-[#0b0a17] p-5 lg:hidden">
              <Aurora />
              <div className="relative">
                <p className="font-display text-lg font-bold leading-snug text-white">{panelHeadline}</p>
                <div className="mt-3">
                  <PresenceDots />
                </div>
              </div>
            </div>

            <SpotlightCard className="p-6 sm:p-8">
              <WordReveal text={title} className="font-display text-3xl font-bold tracking-tight" />
              <p className="mt-2 text-sm text-ink-dim">{subtitle}</p>
              <div className="mt-7">{children}</div>
            </SpotlightCard>
          </div>
        </div>
      </main>
    </div>
  );
}

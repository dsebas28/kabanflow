import type { ReactNode } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import WordReveal from "@/components/WordReveal";
import Masthead from "@/components/editorial/Masthead";
import ActivityFeed from "@/components/auth/ActivityFeed";
import PresenceDots from "@/components/auth/PresenceDots";

/** Split layout shared by login and register: a "letter" panel on the left, the form on the right. */
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
    <div className="editorial grid min-h-screen bg-background text-ink lg:grid-cols-[1fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-surface-alt p-10 lg:flex xl:p-14">
        <Link href="/" className="w-fit">
          <Masthead />
        </Link>

        <div className="max-w-md">
          <span aria-hidden="true" className="font-serif-ed mb-4 block text-6xl italic leading-none text-[var(--mark)]">
            “
          </span>
          <WordReveal as="h2" text={panelHeadline} delay={0.2} className="font-serif-ed text-4xl font-medium leading-[1.1] tracking-tight" />
          <div className="mt-8 border-t border-border pt-6">
            <PresenceDots />
          </div>
          <div className="mt-8 hidden [@media(min-height:820px)]:block">
            <ActivityFeed />
          </div>
        </div>

        <p className="font-serif-ed text-xs italic text-ink-faint">Cuaderno de bitácora — actualizado en tiempo real</p>
      </aside>

      <main className="relative flex flex-col px-5 py-5 sm:px-10 sm:py-6">
        <div className="flex items-center justify-between lg:justify-end">
          <Link href="/" className="lg:hidden">
            <Masthead size={19} />
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-8 sm:py-10">
          <div className="w-full max-w-sm">
            <div className="mb-6 border-b border-border pb-6 lg:hidden">
              <p className="font-serif-ed text-sm italic text-ink-faint">{panelHeadline}</p>
            </div>

            <WordReveal text={title} className="font-serif-ed text-3xl font-medium tracking-tight" />
            <p className="mt-2 text-sm text-ink-dim">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

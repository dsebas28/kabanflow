"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronsLeft, LayoutDashboard, Menu, Search, X } from "lucide-react";
import Avatar from "@/components/Avatar";
import Logo, { LogoMark } from "@/components/Logo";
import SignOutButton from "@/components/SignOutButton";
import ThemeToggle from "@/components/ThemeToggle";
import CommandPalette from "@/components/app/CommandPalette";
import { UserProvider, type AppUser } from "@/context/UserContext";
import type { BoardSummary } from "@/types/models";

type SidebarBoard = Pick<BoardSummary, "id" | "title" | "color">;

export const BOARDS_CHANGED_EVENT = "kanbanflow:boards-changed";

function SidebarContent({
  collapsed,
  boards,
  user,
  onNavigate,
  onSearch,
}: {
  collapsed: boolean;
  boards: SidebarBoard[];
  user: AppUser;
  onNavigate?: () => void;
  onSearch: () => void;
}) {
  const pathname = usePathname();
  const onList = pathname === "/boards";

  return (
    <div className="flex h-full flex-col">
      <div className={`flex h-16 items-center ${collapsed ? "justify-center" : "px-5"}`}>
        <Link href="/boards" onClick={onNavigate} aria-label="KanbanFlow">
          {collapsed ? <LogoMark size={30} /> : <Logo size={28} />}
        </Link>
      </div>

      <div className="px-3">
        <button
          type="button"
          onClick={onSearch}
          title="Buscar (Ctrl K)"
          className={`group flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-surface-alt/60 text-sm text-ink-faint transition-colors hover:border-brand-500/40 hover:text-ink-dim ${
            collapsed ? "h-10 justify-center" : "h-10 px-3"
          }`}
        >
          <Search className="h-4 w-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Buscar</span>
              <kbd className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold">Ctrl K</kbd>
            </>
          )}
        </button>
      </div>

      <nav className="mt-4 px-3" aria-label="Principal">
        <Link
          href="/boards"
          onClick={onNavigate}
          title="Tableros"
          className={`relative flex h-10 items-center gap-3 rounded-xl text-sm font-semibold transition-colors ${
            collapsed ? "justify-center" : "px-3"
          } ${onList ? "text-brand-600 dark:text-brand-300" : "text-ink-dim hover:text-ink"}`}
        >
          {onList && (
            <motion.span
              layoutId="nav-pill"
              className="absolute inset-0 rounded-xl bg-brand-500/10"
              transition={{ type: "spring", stiffness: 500, damping: 38 }}
            />
          )}
          <LayoutDashboard className="relative h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="relative">Tableros</span>}
        </Link>
      </nav>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto px-3">
        {!collapsed && <p className="px-3 pb-2 text-xs font-semibold text-ink-faint">Recientes</p>}
        <ul className="space-y-0.5">
          {boards.map((b, i) => {
            const isActive = pathname === `/boards/${b.id}`;
            return (
              <motion.li
                key={b.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 * i, duration: 0.3 }}
              >
                <Link
                  href={`/boards/${b.id}`}
                  onClick={onNavigate}
                  title={b.title}
                  className={`relative flex h-9 items-center gap-3 rounded-lg text-sm transition-colors ${
                    collapsed ? "justify-center" : "px-3"
                  } ${isActive ? "font-semibold text-ink" : "text-ink-dim hover:text-ink"}`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg bg-surface-alt"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                  <span className="relative h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: b.color }} />
                  {!collapsed && <span className="relative truncate">{b.title}</span>}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <div className={`border-t border-border p-3 ${collapsed ? "flex justify-center" : ""}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "" : "rounded-xl px-2 py-1.5"}`}>
          <Avatar name={user.name} color={user.color} size={32} />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-ink-faint">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AppShell({ user, children }: { user: AppUser; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [boards, setBoards] = useState<SidebarBoard[]>([]);

  const loadBoards = useCallback(() => {
    fetch("/api/boards")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.boards) setBoards(data.boards);
      });
  }, []);

  useEffect(() => {
    loadBoards();
    window.addEventListener(BOARDS_CHANGED_EVENT, loadBoards);
    return () => window.removeEventListener(BOARDS_CHANGED_EVENT, loadBoards);
  }, [loadBoards]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openSearch = () => {
    setDrawerOpen(false);
    setPaletteOpen(true);
  };

  return (
    <UserProvider user={user}>
      <div className="flex h-screen overflow-hidden bg-background">
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? 76 : 272 }}
          transition={{ type: "spring", stiffness: 380, damping: 36 }}
          className="relative hidden flex-shrink-0 border-r border-border bg-surface lg:block"
        >
          <SidebarContent collapsed={collapsed} boards={boards} user={user} onSearch={openSearch} />
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
            className="absolute -right-3 top-[72px] z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink-dim shadow-sm transition-colors hover:text-ink"
          >
            <motion.span animate={{ rotate: collapsed ? 180 : 0 }}>
              <ChevronsLeft className="h-3.5 w-3.5" />
            </motion.span>
          </button>
        </motion.aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 flex-shrink-0 items-center justify-between gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Abrir menú"
                className="btn-ghost !p-2 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link href="/boards" className="lg:hidden" aria-label="KanbanFlow">
                <LogoMark size={28} />
              </Link>
              <button
                type="button"
                onClick={openSearch}
                className="hidden h-10 w-72 cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-surface-alt/60 px-3 text-sm text-ink-faint transition-colors hover:border-brand-500/40 hover:text-ink-dim md:flex"
              >
                <Search className="h-4 w-4" />
                <span className="flex-1 text-left">Buscar tableros y acciones</span>
                <kbd className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold">Ctrl K</kbd>
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={openSearch} aria-label="Buscar" className="btn-ghost !p-2 md:hidden">
                <Search className="h-5 w-5" />
              </button>
              <ThemeToggle />
              <SignOutButton />
            </div>
          </header>

          <main className="relative min-h-0 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="absolute inset-y-0 left-0 w-[290px] max-w-[85vw] border-r border-border bg-surface shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Cerrar menú"
                className="btn-ghost absolute right-3 top-3 !p-2"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarContent collapsed={false} boards={boards} user={user} onNavigate={() => setDrawerOpen(false)} onSearch={openSearch} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} boards={boards} />
    </UserProvider>
  );
}

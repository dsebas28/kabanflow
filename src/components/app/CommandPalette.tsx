"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, LayoutDashboard, LogOut, Moon, Plus, Search, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import type { BoardSummary } from "@/types/models";

type Item = {
  id: string;
  group: "Acciones" | "Tableros";
  label: string;
  hint?: string;
  color?: string;
  icon?: ComponentType<{ className?: string }>;
  run: () => void;
};

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function CommandPalette({
  open,
  onClose,
  boards,
}: {
  open: boolean;
  onClose: () => void;
  boards: Pick<BoardSummary, "id" | "title" | "color">[];
}) {
  return (
    <AnimatePresence>
      {open && <PaletteContent key="palette" onClose={onClose} boards={boards} />}
    </AnimatePresence>
  );
}

function PaletteContent({ onClose, boards }: { onClose: () => void; boards: Pick<BoardSummary, "id" | "title" | "color">[] }) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const items = useMemo<Item[]>(() => {
    const go = (path: string) => () => {
      onClose();
      router.push(path);
    };
    const all: Item[] = [
      { id: "new", group: "Acciones", label: "Crear tablero", icon: Plus, run: go("/boards?new=1") },
      { id: "home", group: "Acciones", label: "Ir a todos los tableros", icon: LayoutDashboard, run: go("/boards") },
      {
        id: "theme",
        group: "Acciones",
        label: theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro",
        icon: theme === "dark" ? Sun : Moon,
        run: () => {
          toggleTheme();
          onClose();
        },
      },
      { id: "out", group: "Acciones", label: "Cerrar sesión", icon: LogOut, run: () => signOut({ callbackUrl: "/" }) },
      ...boards.map<Item>((b) => ({
        id: b.id,
        group: "Tableros",
        label: b.title,
        color: b.color,
        hint: "Abrir",
        run: go(`/boards/${b.id}`),
      })),
    ];
    const q = normalize(query.trim());
    return q ? all.filter((i) => normalize(i.label).includes(q)) : all;
  }, [query, boards, theme, toggleTheme, router, onClose]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (items.length ? (a + 1) % items.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (items.length ? (a - 1 + items.length) % items.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      items[active]?.run();
    }
  };

  let lastGroup = "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 px-4 pt-[14vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Paleta de comandos"
        initial={{ opacity: 0, y: -16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 text-ink-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Busca un tablero o una acción"
            className="h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          <kbd className="rounded-md border border-border px-1.5 py-0.5 text-[10px] font-semibold text-ink-faint">Esc</kbd>
        </div>

        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {items.length === 0 && <p className="px-3 py-8 text-center text-sm text-ink-dim">No hay resultados para «{query}».</p>}
          {items.map((item, i) => {
            const showGroup = item.group !== lastGroup;
            lastGroup = item.group;
            const Icon = item.icon;
            return (
              <div key={item.id}>
                {showGroup && <p className="px-3 pb-1 pt-3 text-xs font-semibold text-ink-faint first:pt-1">{item.group}</p>}
                <button
                  type="button"
                  data-index={i}
                  onMouseMove={() => active !== i && setActive(i)}
                  onClick={item.run}
                  className="relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-ink"
                >
                  {active === i && (
                    <motion.span
                      layoutId="palette-active"
                      className="absolute inset-0 rounded-xl bg-brand-500/10"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                  <span className="relative flex h-5 w-5 items-center justify-center">
                    {Icon ? (
                      <Icon className="h-4 w-4 text-ink-dim" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    )}
                  </span>
                  <span className="relative flex-1 truncate font-medium">{item.label}</span>
                  {active === i && <CornerDownLeft className="relative h-3.5 w-3.5 text-ink-faint" />}
                </button>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

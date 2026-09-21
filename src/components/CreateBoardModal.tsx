"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { BOARDS_CHANGED_EVENT } from "@/components/app/AppShell";

const COLORS = ["#7c3aed", "#14b8a6", "#f59e0b", "#ef4444", "#0ea5e9", "#ec4899"];

export default function CreateBoardModal({
  onCreated,
  defaultOpen = false,
  onClose,
  variant = "button",
}: {
  onCreated: () => void;
  defaultOpen?: boolean;
  onClose?: () => void;
  variant?: "button" | "card";
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  const close = () => {
    setOpen(false);
    setTitle("");
    setDescription("");
    setColor(COLORS[0]);
    onClose?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: description || undefined, color }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "No se pudo crear el tablero");
      return;
    }

    toast.success("Tablero creado");
    close();
    onCreated();
    window.dispatchEvent(new Event(BOARDS_CHANGED_EVENT));
  };

  return (
    <>
      {variant === "button" ? (
        <button type="button" onClick={() => setOpen(true)} className="btn-primary btn-shimmer">
          <Plus className="h-4 w-4" /> Nuevo tablero
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex h-full min-h-[210px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border text-ink-dim transition-colors hover:border-brand-500/60 hover:bg-brand-500/5 hover:text-brand-600"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-alt transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110">
            <Plus className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold">Nuevo tablero</span>
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={close}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Nuevo tablero"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="card-surface w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <motion.div
                className="h-2"
                animate={{ backgroundColor: color }}
                transition={{ duration: 0.3 }}
              />
              <div className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold">Nuevo tablero</h2>
                  <button type="button" onClick={close} className="btn-ghost !p-1.5" aria-label="Cerrar">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="board-title" className="mb-1.5 block text-sm font-medium text-ink-dim">
                      Título
                    </label>
                    <input
                      id="board-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="input-base"
                      placeholder="Ej. Lanzamiento de producto"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label htmlFor="board-desc" className="mb-1.5 block text-sm font-medium text-ink-dim">
                      Descripción <span className="text-ink-faint">(opcional)</span>
                    </label>
                    <textarea
                      id="board-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="input-base resize-none"
                      rows={2}
                      placeholder="¿De qué trata este tablero?"
                    />
                  </div>

                  <div>
                    <span className="mb-2 block text-sm font-medium text-ink-dim">Color</span>
                    <div className="flex gap-2.5">
                      {COLORS.map((c) => (
                        <motion.button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          animate={{ scale: color === c ? 1.15 : 1 }}
                          className="h-7 w-7 cursor-pointer rounded-full"
                          style={{
                            backgroundColor: c,
                            boxShadow: color === c ? `0 0 0 2px var(--color-surface), 0 0 0 4px ${c}` : "none",
                          }}
                          aria-label={`Elegir color ${c}`}
                          aria-pressed={color === c}
                        />
                      ))}
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary btn-shimmer w-full py-2.5">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear tablero"}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

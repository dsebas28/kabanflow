"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus, X } from "lucide-react";
import toast from "react-hot-toast";

const COLORS = ["#7c3aed", "#14b8a6", "#f59e0b", "#ef4444", "#0ea5e9", "#ec4899"];

export default function CreateBoardModal({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  const close = () => {
    setOpen(false);
    setTitle("");
    setDescription("");
    setColor(COLORS[0]);
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
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        <Plus className="h-4 w-4" /> Nuevo tablero
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="card-surface w-full max-w-sm p-5 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold">Nuevo tablero</h2>
                <button type="button" onClick={close} className="btn-ghost !p-1.5" aria-label="Cerrar">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="board-title" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-dim">
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
                  <label htmlFor="board-desc" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-dim">
                    Descripción (opcional)
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
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-dim">Color</span>
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`h-7 w-7 rounded-full transition-transform cursor-pointer ${color === c ? "scale-110 ring-2 ring-offset-2 ring-offset-surface" : ""}`}
                        style={{ backgroundColor: c, ...(color === c ? { boxShadow: `0 0 0 2px ${c}` } : {}) }}
                        aria-label={`Elegir color ${c}`}
                      />
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear tablero"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

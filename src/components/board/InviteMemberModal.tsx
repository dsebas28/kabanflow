"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, UserPlus, X } from "lucide-react";
import toast from "react-hot-toast";
import type { BoardMemberModel } from "@/types/models";

export default function InviteMemberModal({
  boardId,
  onInvited,
}: {
  boardId: string;
  onInvited: (member: BoardMemberModel) => void;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/boards/${boardId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || "No se pudo invitar");
      return;
    }

    toast.success(`${data.member.user.name} se unió al tablero`);
    onInvited(data.member);
    setEmail("");
    setOpen(false);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary !py-1.5 !px-3 text-xs">
        <UserPlus className="h-3.5 w-3.5" /> Invitar
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="card-surface w-full max-w-sm p-5 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold">Invitar al tablero</h2>
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost !p-1.5" aria-label="Cerrar">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={submit} className="space-y-3">
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="input-base"
                />
                <p className="text-xs text-ink-faint">La persona debe tener ya una cuenta en KanbanFlow.</p>
                <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar invitación"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

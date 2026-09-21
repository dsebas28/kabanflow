"use client";

import { AnimatePresence, motion } from "framer-motion";
import Avatar from "@/components/Avatar";

export type PresenceUser = { id: string; name: string; color: string };

export default function PresenceBar({ users }: { users: PresenceUser[] }) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
      </span>
      <span className="text-xs font-medium text-ink-dim">En línea:</span>
      <div className="flex -space-x-2">
        <AnimatePresence>
          {users.map((u) => (
            <motion.div key={u.id} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
              <Avatar name={u.name} color={u.color} size={26} ring />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

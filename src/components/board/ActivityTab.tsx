"use client";

import { motion } from "framer-motion";
import { History, Loader2 } from "lucide-react";
import Avatar from "@/components/Avatar";
import { useNow } from "@/hooks/useNow";
import { relativeTime } from "@/lib/time";
import type { ActivityItem } from "@/types/models";

export default function ActivityTab({ activities, loading }: { activities: ActivityItem[]; loading: boolean }) {
  const now = useNow();

  if (loading && activities.length === 0) {
    return (
      <div className="flex justify-center py-14 text-ink-faint">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
          <History className="h-5 w-5" />
        </span>
        <p className="mt-4 text-sm font-semibold">Aún no hay actividad</p>
        <p className="mt-1 text-xs text-ink-dim">Cuando alguien cree, mueva o comente tarjetas, lo verás aquí.</p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-1 overflow-y-auto px-4 py-4">
      <span aria-hidden="true" className="absolute bottom-6 left-[29px] top-6 w-px bg-border" />
      {activities.map((a) => (
        <motion.li
          key={a.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="relative flex gap-3 rounded-xl px-1 py-2"
        >
          <span className="relative z-10 rounded-full ring-4 ring-surface">
            <Avatar name={a.actor.name} color={a.actor.avatarColor} size={28} />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-sm leading-snug">
              <span className="font-semibold">{a.actor.name}</span> <span className="text-ink-dim">{a.text}</span>
            </p>
            <p className="mt-0.5 text-[11px] text-ink-faint">{relativeTime(a.createdAt, now)}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}

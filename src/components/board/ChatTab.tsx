"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessagesSquare, SendHorizontal } from "lucide-react";
import Avatar from "@/components/Avatar";
import { clockTime } from "@/lib/time";
import type { ChatMessage } from "@/types/models";

const GROUP_WINDOW_MS = 5 * 60 * 1000;

export default function ChatTab({
  messages,
  currentUserId,
  typingNames,
  loading,
  sending,
  onSend,
  onTyping,
}: {
  messages: ChatMessage[];
  currentUserId: string;
  typingNames: string[];
  loading: boolean;
  sending: boolean;
  onSend: (body: string) => Promise<boolean>;
  onTyping: () => void;
}) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typingNames.length]);

  const submit = async () => {
    const text = draft;
    if (!text.trim() || sending) return;
    setDraft("");
    const ok = await onSend(text);
    if (!ok) setDraft(text);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {loading && messages.length === 0 && (
          <div className="flex justify-center py-10 text-ink-faint">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
              <MessagesSquare className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm font-semibold">Todavía no hay mensajes</p>
            <p className="mt-1 text-xs text-ink-dim">Saluda al equipo: lo que escribas lo ven al instante.</p>
          </div>
        )}

        {messages.map((m, i) => {
          const mine = m.author.id === currentUserId;
          const prev = messages[i - 1];
          const grouped =
            prev && prev.author.id === m.author.id && new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() < GROUP_WINDOW_MS;

          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""} ${grouped ? "" : "mt-3"}`}
            >
              <div className="w-7 flex-shrink-0">{!mine && !grouped && <Avatar name={m.author.name} color={m.author.avatarColor} size={28} />}</div>
              <div className={`flex max-w-[78%] flex-col ${mine ? "items-end" : "items-start"}`}>
                {!mine && !grouped && <span className="mb-0.5 px-1 text-[11px] font-semibold text-ink-dim">{m.author.name}</span>}
                <div
                  className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-snug ${
                    mine ? "rounded-br-md bg-brand-600 text-white" : "rounded-bl-md bg-surface-alt text-ink"
                  }`}
                >
                  {m.body}
                </div>
                <span className="mt-0.5 px-1 text-[10px] text-ink-faint">{clockTime(m.createdAt)}</span>
              </div>
            </motion.div>
          );
        })}

        <AnimatePresence>
          {typingNames.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 overflow-hidden px-1 pt-2 text-xs text-ink-dim"
            >
              <span className="flex gap-1 rounded-full bg-surface-alt px-2.5 py-2">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-ink-faint"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.8, delay: i * 0.13, repeat: Infinity }}
                  />
                ))}
              </span>
              {typingNames.length === 1 ? `${typingNames[0]} está escribiendo` : `${typingNames.length} personas están escribiendo`}
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-end gap-2 border-t border-border p-3"
      >
        <textarea
          value={draft}
          rows={1}
          maxLength={1000}
          onChange={(e) => {
            setDraft(e.target.value);
            onTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Escribe un mensaje"
          aria-label="Mensaje"
          className="input-base max-h-28 min-h-[42px] resize-none py-2.5 text-sm"
        />
        <motion.button
          type="submit"
          disabled={!draft.trim() || sending}
          whileTap={{ scale: 0.9 }}
          aria-label="Enviar mensaje"
          className="btn-primary !h-[42px] !w-[42px] flex-shrink-0 !p-0"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
        </motion.button>
      </form>
    </div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { History, MessagesSquare, Paperclip, X } from "lucide-react";
import ActivityTab from "@/components/board/ActivityTab";
import ChatTab from "@/components/board/ChatTab";
import FilesTab from "@/components/board/FilesTab";
import type { PanelTab, useBoardPanel } from "@/hooks/useBoardPanel";

type PanelData = ReturnType<typeof useBoardPanel>;

const TABS: { id: PanelTab; label: string; icon: typeof MessagesSquare }[] = [
  { id: "chat", label: "Chat", icon: MessagesSquare },
  { id: "activity", label: "Actividad", icon: History },
  { id: "files", label: "Archivos", icon: Paperclip },
];

export default function BoardPanel({
  open,
  tab,
  onTabChange,
  onClose,
  data,
  currentUserId,
  isOwner,
}: {
  open: boolean;
  tab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
  onClose: () => void;
  data: PanelData;
  currentUserId: string;
  isOwner: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px] lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            key="panel"
            role="complementary"
            aria-label="Panel del tablero"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
            className="fixed bottom-0 right-0 top-16 z-40 flex w-full flex-col border-l border-border bg-surface shadow-2xl sm:w-[400px]"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-3">
              <div role="tablist" aria-label="Secciones del panel" className="relative flex gap-1 rounded-xl bg-surface-alt p-1">
                {TABS.map((t) => {
                  const active = tab === t.id;
                  const badge = t.id === "chat" ? data.unread : t.id === "files" ? 0 : 0;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => onTabChange(t.id)}
                      className={`relative flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        active ? "text-ink" : "text-ink-dim hover:text-ink"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="panel-tab-pill"
                          className="absolute inset-0 rounded-lg bg-surface shadow-sm"
                          transition={{ type: "spring", stiffness: 500, damping: 38 }}
                        />
                      )}
                      <t.icon className="relative h-3.5 w-3.5" />
                      <span className="relative">{t.label}</span>
                      {badge > 0 && <span className="relative rounded-full bg-brand-600 px-1.5 text-[10px] text-white">{badge}</span>}
                    </button>
                  );
                })}
              </div>
              <button type="button" onClick={onClose} aria-label="Cerrar panel" className="btn-ghost !p-2">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.16 }}
                  className="h-full overflow-y-auto"
                >
                  {tab === "chat" && (
                    <ChatTab
                      messages={data.messages}
                      currentUserId={currentUserId}
                      typingNames={data.typingNames}
                      loading={data.loading}
                      sending={data.sending}
                      onSend={data.sendMessage}
                      onTyping={data.notifyTyping}
                    />
                  )}
                  {tab === "activity" && <ActivityTab activities={data.activities} loading={data.loading} />}
                  {tab === "files" && (
                    <FilesTab files={data.files} loading={data.loading} currentUserId={currentUserId} isOwner={isOwner} onRemove={data.removeFile} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, Loader2, Paperclip, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import FileThumb from "@/components/board/FileThumb";
import { useNow } from "@/hooks/useNow";
import { relativeTime } from "@/lib/time";
import { formatBytes } from "@/lib/format";
import type { AttachmentModel } from "@/types/models";

export default function FilesTab({
  files,
  loading,
  currentUserId,
  isOwner,
  onRemove,
}: {
  files: AttachmentModel[];
  loading: boolean;
  currentUserId: string;
  isOwner: boolean;
  onRemove: (id: string) => Promise<boolean>;
}) {
  const now = useNow();

  if (loading && files.length === 0) {
    return (
      <div className="flex justify-center py-14 text-ink-faint">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
          <Paperclip className="h-5 w-5" />
        </span>
        <p className="mt-4 text-sm font-semibold">Aún no hay archivos</p>
        <p className="mt-1 text-xs text-ink-dim">Abre una tarjeta y adjunta imágenes, PDF u otros archivos. Aparecerán aquí para todo el equipo.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2 overflow-y-auto px-4 py-4">
      <AnimatePresence initial={false}>
        {files.map((f) => {
          const canDelete = isOwner || f.uploader.id === currentUserId;
          return (
            <motion.li
              key={f.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 24 }}
              className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-2.5"
            >
              <FileThumb id={f.id} name={f.name} mimeType={f.mimeType} size={44} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold" title={f.name}>
                  {f.name}
                </p>
                <p className="truncate text-[11px] text-ink-faint">
                  {formatBytes(f.size)} · en «{f.card?.title ?? "tarjeta"}» · {f.uploader.name} · {relativeTime(f.createdAt, now)}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-0.5">
                <a href={`/api/attachments/${f.id}`} target="_blank" rel="noreferrer" download={f.name} aria-label={`Descargar ${f.name}`} className="btn-ghost !p-2">
                  <Download className="h-4 w-4" />
                </a>
                {canDelete && (
                  <button
                    type="button"
                    aria-label={`Eliminar ${f.name}`}
                    onClick={async () => {
                      if (!(await onRemove(f.id))) toast.error("No se pudo eliminar el archivo");
                    }}
                    className="btn-ghost !p-2 hover:!text-error-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}

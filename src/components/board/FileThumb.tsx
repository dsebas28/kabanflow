import { File, FileArchive, FileSpreadsheet, FileText } from "lucide-react";

const IMAGE = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);

export const isImage = (mime: string) => IMAGE.has(mime);

/** Square preview: the image itself when it is one, otherwise an icon that hints at the file kind. */
export default function FileThumb({ id, name, mimeType, size = 40 }: { id: string; name: string; mimeType: string; size?: number }) {
  const box = { width: size, height: size };

  if (isImage(mimeType)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={`/api/attachments/${id}`} alt={name} loading="lazy" style={box} className="flex-shrink-0 rounded-lg border border-border object-cover" />
    );
  }

  const Icon = mimeType.includes("zip")
    ? FileArchive
    : mimeType.includes("sheet") || mimeType.includes("excel") || mimeType === "text/csv"
      ? FileSpreadsheet
      : mimeType === "application/pdf" || mimeType.startsWith("text/") || mimeType.includes("word") || mimeType.includes("presentation")
        ? FileText
        : File;

  return (
    <span style={box} className="flex flex-shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-300">
      <Icon className="h-[45%] w-[45%]" />
    </span>
  );
}

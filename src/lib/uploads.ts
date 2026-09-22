import path from "node:path";
import { mkdir, unlink } from "node:fs/promises";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Declared types we accept. The browser-supplied type is untrusted, so images
// are also checked against their magic bytes and everything except images is
// served as a forced download.
export const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

export const INLINE_MIME = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);

export function sanitizeFileName(raw: string): string {
  const base = raw.split(/[\\/]/).pop() ?? "archivo";
   
  const cleaned = base.replace(/[\u0000-\u001f\u007f"<>:|?*]/g, "").trim().slice(0, 120);
  return cleaned || "archivo";
}

/** Extension for the stored file name; restricted so it can never carry a path. */
export function safeExtension(name: string): string {
  const ext = path.extname(name).slice(1).toLowerCase();
  return /^[a-z0-9]{1,8}$/.test(ext) ? `.${ext}` : "";
}

export function looksLikeImage(mime: string, bytes: Uint8Array): boolean {
  const starts = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  switch (mime) {
    case "image/png":
      return starts(0x89, 0x50, 0x4e, 0x47);
    case "image/jpeg":
      return starts(0xff, 0xd8, 0xff);
    case "image/gif":
      return starts(0x47, 0x49, 0x46, 0x38);
    case "image/webp":
      return starts(0x52, 0x49, 0x46, 0x46) && bytes[8] === 0x57 && bytes[9] === 0x45;
    default:
      return true;
  }
}

export async function ensureUploadDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export function storedPath(storedName: string) {
  // storedName is generated server-side (cuid + safe extension); basename is a second guard.
  return path.join(UPLOAD_DIR, path.basename(storedName));
}

export async function removeStoredFiles(storedNames: string[]) {
  await Promise.all(storedNames.map((n) => unlink(storedPath(n)).catch(() => undefined)));
}

import { randomBytes } from "node:crypto";

/** Unguessable, filesystem-safe identifier for stored upload names. */
export function createId(): string {
  return randomBytes(16).toString("hex");
}

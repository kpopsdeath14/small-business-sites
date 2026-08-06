import { createHash } from "node:crypto";

/** Stable content hash of a brief, used to detect whether it changed since the last generation. */
export function hashBrief(brief: unknown): string {
  return createHash("sha256").update(JSON.stringify(brief)).digest("hex").slice(0, 16);
}

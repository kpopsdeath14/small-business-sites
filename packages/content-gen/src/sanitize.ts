import { BriefSchema, type Brief } from "./schema.js";

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeStrings(value: unknown): unknown {
  if (typeof value === "string") return stripHtml(value);
  if (Array.isArray(value)) return value.map(sanitizeStrings);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, sanitizeStrings(v)]));
  }
  return value;
}

/** Cleans free-form/scraped input (stray HTML, whitespace) and validates it against the brief schema, filling defaults. */
export function sanitizeBrief(raw: unknown): Brief {
  const cleaned = sanitizeStrings(raw);
  return BriefSchema.parse(cleaned);
}

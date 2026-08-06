import fs from "node:fs/promises";
import { sanitizeBrief, type Brief } from "@sitegen/content-gen";

export async function validateBrief(briefPath: string): Promise<Brief> {
  const raw = await fs.readFile(briefPath, "utf-8");
  const parsed = JSON.parse(raw);
  return sanitizeBrief(parsed);
}

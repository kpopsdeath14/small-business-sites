import fs from "node:fs/promises";
import path from "node:path";
import type { GeneratedContent } from "@sitegen/content-gen";

interface CacheFile {
  briefHash: string;
  content: GeneratedContent;
}

function cachePath(repoRoot: string, slug: string): string {
  return path.join(repoRoot, "clients", "generated", slug, "content.json");
}

/** Returns the cached generated content only if it was produced from the exact same brief. */
export async function readContentCache(repoRoot: string, slug: string, briefHash: string): Promise<GeneratedContent | null> {
  try {
    const raw = await fs.readFile(cachePath(repoRoot, slug), "utf-8");
    const parsed = JSON.parse(raw) as CacheFile;
    return parsed.briefHash === briefHash ? parsed.content : null;
  } catch {
    return null;
  }
}

export async function writeContentCache(repoRoot: string, slug: string, briefHash: string, content: GeneratedContent): Promise<void> {
  const file = cachePath(repoRoot, slug);
  await fs.mkdir(path.dirname(file), { recursive: true });
  const payload: CacheFile = { briefHash, content };
  await fs.writeFile(file, JSON.stringify(payload, null, 2) + "\n");
}

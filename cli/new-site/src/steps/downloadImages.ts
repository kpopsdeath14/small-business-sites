import fs from "node:fs/promises";
import path from "node:path";
import { warn } from "../utils/logger.js";

/** Downloads each photo into <siteDir>/public/photos, returning local `/photos/...` paths in the same order.
 *  Falls back to the original URL for any photo that fails to download, so the pipeline never hard-fails on a bad link. */
export async function downloadImages(photoUrls: string[], siteDir: string): Promise<string[]> {
  if (photoUrls.length === 0) return [];

  const publicPhotosDir = path.join(siteDir, "public", "photos");
  await fs.mkdir(publicPhotosDir, { recursive: true });

  const results: string[] = [];
  for (let i = 0; i < photoUrls.length; i++) {
    const url = photoUrls[i];
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      const ext = guessExtension(response.headers.get("content-type"), url);
      const fileName = `${i}${ext}`;
      await fs.writeFile(path.join(publicPhotosDir, fileName), buffer);
      results.push(`/photos/${fileName}`);
    } catch (err) {
      warn(`Не удалось скачать фото ${url}: ${(err as Error).message}. Использую ссылку как есть.`);
      results.push(url);
    }
  }
  return results;
}

function guessExtension(contentType: string | null, url: string): string {
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("webp")) return ".webp";
  if (contentType?.includes("gif")) return ".gif";
  if (contentType?.includes("jpeg") || contentType?.includes("jpg")) return ".jpg";
  const match = url.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i);
  return match ? `.${match[1].toLowerCase()}` : ".jpg";
}

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { warn } from "../utils/logger.js";

const MAX_WIDTH = 1600;
const WEBP_QUALITY = 78;

async function downloadAndOptimize(url: string, destPath: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const optimized = await sharp(buffer)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    await fs.writeFile(destPath, optimized);
    return true;
  } catch (err) {
    warn(`Не удалось скачать/обработать фото ${url}: ${(err as Error).message}. Использую ссылку как есть.`);
    return false;
  }
}

/** Joins a site's base path (e.g. "/" or "/my-repo/") with a root-relative asset path, so downloaded
 *  images resolve correctly when the site is deployed under a subpath (GitHub Pages project sites). */
function withBase(basePath: string, assetPath: string): string {
  return `${basePath.replace(/\/$/, "")}${assetPath}`;
}

/** Downloads each gallery photo into <siteDir>/public/photos, re-encoding to a size-capped WebP so pages
 *  stay light on slow/throttled connections. Returns local `/photos/...` paths (prefixed with `basePath`
 *  when the site deploys under a subpath) in the same order. Falls back to the original URL for any photo
 *  that fails to download or process, so the pipeline never hard-fails on a bad link. */
export async function downloadImages(photoUrls: string[], siteDir: string, basePath = "/"): Promise<string[]> {
  if (photoUrls.length === 0) return [];

  const publicPhotosDir = path.join(siteDir, "public", "photos");
  await fs.mkdir(publicPhotosDir, { recursive: true });

  const results: string[] = [];
  for (let i = 0; i < photoUrls.length; i++) {
    const fileName = `${i}.webp`;
    const ok = await downloadAndOptimize(photoUrls[i], path.join(publicPhotosDir, fileName));
    results.push(ok ? withBase(basePath, `/photos/${fileName}`) : photoUrls[i]);
  }
  return results;
}

/** Downloads and optimizes a single standalone photo (e.g. a hero banner image not tied to a list item).
 *  Returns the local `/photos/<name>.webp` path (prefixed with `basePath`), or the original URL if the
 *  download/processing fails. */
export async function downloadSinglePhoto(url: string, siteDir: string, name: string, basePath = "/"): Promise<string> {
  const publicPhotosDir = path.join(siteDir, "public", "photos");
  await fs.mkdir(publicPhotosDir, { recursive: true });
  const fileName = `${name}.webp`;
  const ok = await downloadAndOptimize(url, path.join(publicPhotosDir, fileName));
  return ok ? withBase(basePath, `/photos/${fileName}`) : url;
}

/** Same optimization, applied to any array of items that may carry an optional `photo` URL (menu items,
 *  highlights, team members, ...). Returns a new array with `photo` swapped for the local optimized path —
 *  items without a photo, or whose download fails, pass through unchanged. `prefix` keeps filenames from
 *  colliding across different fields (e.g. "highlight-0.webp" vs "team-0.webp"). */
export async function downloadPhotoFields<T extends { photo?: string }>(
  items: T[],
  siteDir: string,
  prefix: string,
  basePath = "/"
): Promise<T[]> {
  if (items.length === 0) return items;

  const publicPhotosDir = path.join(siteDir, "public", "photos");
  await fs.mkdir(publicPhotosDir, { recursive: true });

  const results: T[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.photo) {
      results.push(item);
      continue;
    }
    const fileName = `${prefix}-${i}.webp`;
    const ok = await downloadAndOptimize(item.photo, path.join(publicPhotosDir, fileName));
    results.push(ok ? { ...item, photo: withBase(basePath, `/photos/${fileName}`) } : item);
  }
  return results;
}

import fs from "node:fs/promises";
import path from "node:path";
import type { BusinessType } from "@sitegen/content-gen";
import { info } from "../utils/logger.js";

export interface ScaffoldResult {
  siteDir: string;
  isNewSite: boolean;
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copies the business type's astro-project skeleton into sites/<slug> the first time a client is built.
 * On re-runs (client asking for an edit) the existing site directory is left as-is, since it may already
 * contain manual, site-specific tweaks — only the generated data files get refreshed by later steps.
 */
export async function scaffoldSite(businessType: BusinessType, slug: string, repoRoot: string): Promise<ScaffoldResult> {
  const siteDir = path.join(repoRoot, "sites", slug);
  const alreadyExists = await pathExists(siteDir);

  if (alreadyExists) {
    info(`Сайт sites/${slug} уже существует — обновляю только контент и дизайн, код страницы не трогаю.`);
    return { siteDir, isNewSite: false };
  }

  const templateDir = path.join(repoRoot, "packages", "templates", businessType, "astro-project");
  await fs.cp(templateDir, siteDir, { recursive: true });

  const packageJsonPath = path.join(siteDir, "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
  packageJson.name = `site-${slug}`;
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");

  info(`Скопировал шаблон ${businessType} в sites/${slug}`);
  return { siteDir, isNewSite: true };
}

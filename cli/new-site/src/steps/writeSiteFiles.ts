import fs from "node:fs/promises";
import path from "node:path";
import type { SiteData, DesignTokens } from "@sitegen/shared-ui/types.ts";
import type { SiteConfig } from "@sitegen/variance-engine";

function tokensToCss(tokens: DesignTokens): string {
  const lines = Object.entries(tokens).map(([key, value]) => `  ${key}: ${value};`);
  return `:root {\n${lines.join("\n")}\n}\n`;
}

export async function writeSiteFiles(
  siteDir: string,
  siteData: SiteData,
  siteConfig: SiteConfig,
  tokens: DesignTokens
): Promise<void> {
  const dataDir = path.join(siteDir, "src", "data");
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(path.join(dataDir, "site.json"), JSON.stringify(siteData, null, 2) + "\n");
  await fs.writeFile(path.join(dataDir, "site-config.json"), JSON.stringify(siteConfig, null, 2) + "\n");
  await fs.writeFile(path.join(siteDir, "src", "styles", "tokens.css"), tokensToCss(tokens));
}

/**
 * Keeps the scaffolded astro.config.mjs in sync with the CLI --base flag. Photo paths inside
 * site.json are already prefixed by the download step; Astro's own asset URLs only get the
 * prefix when `base` is set here too. Idempotent: re-runs update the existing values.
 */
export async function syncAstroBase(siteDir: string, basePath: string): Promise<void> {
  if (!basePath || basePath === "/") return;
  const cfgPath = path.join(siteDir, "astro.config.mjs");
  let src = await fs.readFile(cfgPath, "utf-8");
  const base = basePath.replace(/\/+$/, "");
  const site = "https://kpopsdeath14.github.io";
  if (/base:\s*"[^"]*"/.test(src)) {
    src = src.replace(/base:\s*"[^"]*"/, `base: "${base}"`);
    if (/site:\s*"[^"]*"/.test(src)) {
      src = src.replace(/site:\s*"[^"]*"/, `site: "${site}"`);
    }
  } else {
    src = src.replace(
      "defineConfig({",
      `defineConfig({
  // GitHub Pages project site — written by the CLI from --base; edit freely for custom domains.
  site: "${site}",
  base: "${base}",`
    );
  }
  await fs.writeFile(cfgPath, src);
}

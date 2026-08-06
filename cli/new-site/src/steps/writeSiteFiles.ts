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

import path from "node:path";
import { runCommand } from "../utils/runCommand.js";

export async function linkWorkspace(repoRoot: string): Promise<void> {
  await runCommand("npm", ["install"], repoRoot);
}

export async function buildSite(siteDir: string): Promise<string> {
  await runCommand("npx", ["astro", "build"], siteDir);
  return path.join(siteDir, "dist");
}

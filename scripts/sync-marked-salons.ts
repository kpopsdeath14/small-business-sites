// One-off migration: syncs the redesigned L'ATELIER base files into the 10 salons
// marked "сделаны замечания" (+ Алиса) and regenerates each site's design tokens
// from the new palette set, keeping every salon's assigned look.
import fs from "node:fs/promises";
import path from "node:path";
import { tokenSets } from "../packages/templates/beauty-salon/src/tokens.ts";

const ROOT = "/Users/timofeyukhanov/Documents/small_business";
const TPL = path.join(ROOT, "packages/templates/beauty-salon/astro-project");

const SITES = [
  "ak-lash-studio", // Ak lash studio — есть YClients-виджет
  "salon-krasoty-alisa", // Алиса — виджет sonline
  "angels-kasta", // Angels Kasta — clients.site (YClients)
  "klub-krasoty-d-art", // D'Арт — clients.site (YClients)
  "art-look", // без букинга → слот
  "nogtevaya-studiya-astriya", // без букинга → слот
  "studiya-beautyzone", // без букинга → слот
  "beauty", // без букинга → слот
  "krasota-i-stil", // без букинга → слот
  "beauty-bar-mari", // без букинга → слот
];

const COPIES: [string, string][] = [
  ["src/layouts/Base.astro", "src/layouts/Base.astro"],
  ["src/styles/global.css", "src/styles/global.css"],
  ["src/pages/index.astro", "src/pages/index.astro"],
];

for (const site of SITES) {
  const dest = path.join(ROOT, "sites", site);
  for (const [from, to] of COPIES) {
    await fs.copyFile(path.join(TPL, from), path.join(dest, to));
  }
  // Regenerate tokens.css from the NEW palette list, preserving the salon's palette choice.
  const cfg = JSON.parse(await fs.readFile(path.join(dest, "src/data/site-config.json"), "utf8"));
  const tokens = tokenSets[cfg.tokenSetIndex ?? 0] ?? tokenSets[0];
  const css =
    ":root {\n" +
    Object.entries(tokens)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n") +
    "\n}\n";
  await fs.writeFile(path.join(dest, "src/styles/tokens.css"), css);
  console.log(`synced ${site} (palette #${cfg.tokenSetIndex ?? 0})`);
}

import { createRng } from "./seed.js";
import type { BusinessManifest, SelectedSection, SiteConfig } from "./types.js";

export function selectSiteConfig(manifest: BusinessManifest, seedInput: string | number): SiteConfig {
  const rng = createRng(seedInput);

  const tokenSetIndex = Math.floor(rng() * manifest.tokenSetCount);

  const start: SelectedSection[] = [];
  const middle: SelectedSection[] = [];
  const end: SelectedSection[] = [];

  for (const section of manifest.sections) {
    const required = section.required ?? true;
    const probability = section.probability ?? 0.5;
    const included = required || rng() < probability;
    if (!included) continue;

    const variant = Math.floor(rng() * section.variants);
    const entry: SelectedSection = { id: section.id, variant };

    const position = section.position ?? "middle";
    if (position === "start") start.push(entry);
    else if (position === "end") end.push(entry);
    else middle.push(entry);
  }

  shuffleInPlace(middle, rng);

  return {
    seed: String(seedInput),
    tokenSetIndex,
    sections: [...start, ...middle, ...end],
  };
}

function shuffleInPlace<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

import type { BusinessManifest } from "@sitegen/variance-engine";

// One deliberate, fixed editorial layout — this template leans on a single strong composition
// (full-bleed hero, edge-to-edge portfolio grid, asymmetric about) rather than shuffled variants,
// since the whole point is a cohesive, art-directed feel rather than modular sameness.
export const manifest: BusinessManifest = {
  businessType: "tattoo-studio",
  tokenSetCount: 3,
  sections: [
    { id: "hero", variants: 1, required: true, position: "start" },
    { id: "stats", variants: 1, required: true, order: 1 },
    { id: "gallery", variants: 1, required: true, order: 2 },
    { id: "about", variants: 1, required: true, order: 3 },
    { id: "highlights", variants: 1, required: true, order: 4 },
    { id: "services", variants: 1, required: true, order: 5 },
    { id: "contact", variants: 1, required: true, order: 6 },
    { id: "footer", variants: 1, required: true, position: "end" },
  ],
};

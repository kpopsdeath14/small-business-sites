import type { BusinessManifest } from "@sitegen/variance-engine";

export const manifest: BusinessManifest = {
  businessType: "restaurant",
  tokenSetCount: 5,
  sections: [
    { id: "hero", variants: 3, required: true, position: "start" },
    { id: "about", variants: 2, required: true },
    { id: "menu", variants: 3, required: true },
    { id: "highlights", variants: 1, required: false, probability: 0.85 },
    { id: "stats", variants: 1, required: false, probability: 0.7 },
    { id: "gallery", variants: 2, required: false, probability: 0.7 },
    { id: "reviews", variants: 2, required: false, probability: 0.8 },
    { id: "contact", variants: 2, required: true },
    { id: "footer", variants: 1, required: true, position: "end" },
  ],
};

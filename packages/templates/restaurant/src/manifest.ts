import type { BusinessManifest } from "@sitegen/variance-engine";

export const manifest: BusinessManifest = {
  businessType: "restaurant",
  tokenSetCount: 3,
  sections: [
    { id: "hero", variants: 1, required: true, position: "start" },
    { id: "highlights", variants: 1, required: true, order: 1 },
    { id: "gallery", variants: 1, required: true, order: 2 },
    { id: "menu", variants: 1, required: true, order: 3 },
    { id: "about", variants: 1, required: true, order: 4 },
    { id: "reviews", variants: 1, required: false, order: 5 },
    { id: "contact", variants: 1, required: true, order: 6 },
    { id: "footer", variants: 1, required: true, position: "end" },
  ],
};

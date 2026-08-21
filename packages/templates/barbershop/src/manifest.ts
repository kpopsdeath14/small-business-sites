import type { BusinessManifest } from "@sitegen/variance-engine";

export const manifest: BusinessManifest = {
  businessType: "barbershop",
  tokenSetCount: 3,
  sections: [
    { id: "hero", variants: 1, required: true, position: "start" },
    { id: "stats", variants: 1, required: true, order: 1 },
    { id: "gallery", variants: 1, required: true, order: 2 },
    { id: "services", variants: 1, required: true, order: 3 },
    { id: "team", variants: 1, required: true, order: 4 },
    { id: "about", variants: 1, required: true, order: 5 },
    { id: "contact", variants: 1, required: true, order: 6 },
    { id: "footer", variants: 1, required: true, position: "end" },
  ],
};

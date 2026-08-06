import type { BusinessManifest } from "@sitegen/variance-engine";

export const manifest: BusinessManifest = {
  businessType: "autoschool",
  tokenSetCount: 5,
  sections: [
    { id: "hero", variants: 3, required: true, position: "start" },
    { id: "about", variants: 2, required: true },
    { id: "programs", variants: 2, required: true },
    { id: "process", variants: 1, required: false, probability: 0.85 },
    { id: "team", variants: 1, required: false, probability: 0.85 },
    { id: "gallery", variants: 2, required: false, probability: 0.6 },
    { id: "reviews", variants: 2, required: false, probability: 0.8 },
    { id: "contact", variants: 2, required: true },
    { id: "footer", variants: 1, required: true, position: "end" },
  ],
};

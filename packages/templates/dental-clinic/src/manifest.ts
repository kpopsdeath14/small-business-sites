import type { BusinessManifest } from "@sitegen/variance-engine";

export const manifest: BusinessManifest = {
  businessType: "dental-clinic",
  tokenSetCount: 5,
  sections: [
    { id: "hero", variants: 3, required: true, position: "start" },
    { id: "about", variants: 2, required: true },
    { id: "services", variants: 2, required: true },
    { id: "team", variants: 1, required: false, probability: 0.85 },
    { id: "faq", variants: 1, required: false, probability: 0.85 },
    { id: "gallery", variants: 2, required: false, probability: 0.5 },
    { id: "reviews", variants: 2, required: false, probability: 0.85 },
    { id: "contact", variants: 2, required: true },
    { id: "footer", variants: 1, required: true, position: "end" },
  ],
};

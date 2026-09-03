import type { BusinessManifest } from "@sitegen/variance-engine";

// Section order is pinned (every middle section carries an `order`), same reasoning as the salon
// template: a store has a natural funnel — proof → catalog → shipping terms → objections → contact —
// and shuffling it produced sites where visitors hit "как заказать" before seeing a single product.
// Variety comes from the palette and the per-section layout variant instead.
export const manifest: BusinessManifest = {
  businessType: "marketplace-store",
  tokenSetCount: 9,
  sections: [
    { id: "hero", variants: 4, required: true, position: "start" },
    { id: "marketplaces", variants: 2, required: false, probability: 0.95, order: 1 },
    { id: "bestsellers", variants: 1, required: false, probability: 0.85, order: 2 },
    { id: "catalog", variants: 3, required: true, order: 3 },
    { id: "about", variants: 1, required: true, order: 4 },
    { id: "stats", variants: 1, required: false, probability: 0.8, order: 5 },
    { id: "gallery", variants: 2, required: false, probability: 0.6, order: 6 },
    { id: "reviews", variants: 2, required: false, probability: 0.85, order: 7 },
    { id: "delivery", variants: 2, required: true, order: 8 },
    { id: "faq", variants: 1, required: false, probability: 0.8, order: 9 },
    { id: "contact", variants: 1, required: true, order: 10 },
    { id: "footer", variants: 1, required: true, position: "end" },
  ],
};

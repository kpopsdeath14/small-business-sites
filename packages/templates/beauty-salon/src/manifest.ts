import type { BusinessManifest } from "@sitegen/variance-engine";

// Section order is fixed (not shuffled) for this business type — see `order` below. Client feedback:
// a random order per site looked inconsistent across a portfolio of salon sites, more confusing than
// the visual variety was worth. Layout variant and color palette still vary per site; only the order
// of sections on the page is pinned.
export const manifest: BusinessManifest = {
  businessType: "beauty-salon",
  tokenSetCount: 6,
  sections: [
    { id: "hero", variants: 4, required: true, position: "start" },
    { id: "stats", variants: 1, required: true, order: 1 },
    { id: "about", variants: 3, required: true, order: 2 },
    { id: "team", variants: 1, required: false, probability: 0.8, order: 3 },
    { id: "services", variants: 2, required: true, order: 4 },
    { id: "highlights", variants: 1, required: false, probability: 0.85, order: 5 },
    { id: "reviews", variants: 2, required: false, probability: 0.8, order: 6 },
    { id: "contact", variants: 2, required: true, order: 7 },
    { id: "booking", variants: 1, required: true, order: 8 },
    { id: "gallery", variants: 3, required: false, probability: 0.7, order: 9 },
    // Scrolling highlight banner — off by default (opt in per-client), not every salon wants it.
    { id: "ticker", variants: 1, required: false, probability: 0, order: 10 },
    { id: "footer", variants: 1, required: true, position: "end" },
  ],
};

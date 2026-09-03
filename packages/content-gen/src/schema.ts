import { z } from "zod";

export const BusinessTypeSchema = z.enum([
  "restaurant",
  "autoschool",
  "barbershop",
  "dental-clinic",
  "bakery",
  "beauty-salon",
  "tattoo-studio",
  "marketplace-store",
]);
export type BusinessType = z.infer<typeof BusinessTypeSchema>;

export const MenuItemSchema = z.object({
  name: z.string(),
  description: z.string().optional().default(""),
  price: z.union([z.string(), z.number()]).optional(),
  category: z.string().optional(),
  photo: z.string().optional(),
});

export const ReviewSchema = z.object({
  author: z.string(),
  rating: z.number().min(1).max(5).default(5),
  text: z.string(),
});

export const TeamMemberSchema = z.object({
  name: z.string(),
  role: z.string().optional().default(""),
  bio: z.string().optional().default(""),
  photo: z.string().optional(),
});

export const ProcessStepSchema = z.object({
  title: z.string(),
  description: z.string().optional().default(""),
});

export const FaqItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const StatSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export const HighlightItemSchema = z.object({
  name: z.string(),
  description: z.string().optional().default(""),
  price: z.union([z.string(), z.number()]).optional(),
  photo: z.string().optional(),
});

/** Prices in a store must be numbers (the cart adds them up), but clients send them as
 *  "1 290 ₽" / "1290,00" as often as numbers. Coerce once here instead of in every consumer. */
const PriceSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const digits = value.replace(/[^\d.,]/g, "").replace(/\s/g, "").replace(",", ".");
  const parsed = Number.parseFloat(digits);
  return Number.isFinite(parsed) ? parsed : undefined;
}, z.number().nonnegative());

export const ProductSchema = z.object({
  name: z.string(),
  description: z.string().optional().default(""),
  price: PriceSchema,
  /** Pre-discount price. Rendered struck through next to `price`; ignored when not above it. */
  old_price: PriceSchema.optional(),
  category: z.string().optional(),
  photo: z.string().optional(),
  /** Corner label on the card: "Хит", "Новинка", "-30%" … */
  badge: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviews_count: z.number().int().nonnegative().optional(),
  sku: z.string().optional(),
  in_stock: z.boolean().optional().default(true),
  /** Used by the delivery estimate; defaults to 0.5 kg when the seller does not track it. */
  weight_kg: z.number().positive().optional(),
  /** Short spec rows shown in the quick-view: [["Материал", "Хлопок 100%"], …]. */
  specs: z.array(z.tuple([z.string(), z.string()])).optional().default([]),
});

/** The seller's storefront on each marketplace — the trust anchor for this business type:
 *  a visitor who does not know the site still knows the WB/Ozon rating next to it. */
export const MarketplaceSchema = z.object({
  name: z.string(),
  url: z.string(),
  rating: z.number().min(0).max(5).optional(),
  reviews_count: z.number().int().nonnegative().optional(),
  note: z.string().optional().default(""),
});

export const PickupPointSchema = z.object({
  city: z.string(),
  address: z.string(),
  hours: z.string().optional().default(""),
  note: z.string().optional().default(""),
});

export const DeliverySchema = z.object({
  /** Order total above which shipping is free. Omit if the seller never ships free. */
  free_from: PriceSchema.optional(),
  /** Base СДЭК tariff for zone 1; distant zones scale up from it. */
  base_price: PriceSchema.optional(),
  /** e.g. "1-2 рабочих дня" — how long before the parcel is handed to the courier. */
  processing_days: z.string().optional(),
  note: z.string().optional(),
  /** СДЭК pickup points the seller actually ships to, grouped by city in the UI. */
  pickup_points: z.array(PickupPointSchema).optional().default([]),
  /** Where a submitted order is sent. Defaults to whatsapp when social_links has one. */
  order_channel: z.enum(["whatsapp", "telegram", "email"]).optional(),
  /** Overrides the channel target when it differs from `phone` / `social_links`. */
  order_contact: z.string().optional(),
  /** Payment methods offered at checkout. Defaults to card/СБП/on-delivery. */
  payment_methods: z.array(z.string()).optional().default([]),
});

export const BriefSchema = z.object({
  business_type: BusinessTypeSchema,
  name: z.string().min(1),
  seed: z.union([z.string(), z.number()]).optional(),
  description_raw: z.string().optional().default(""),
  address: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  working_hours: z.record(z.string(), z.string()).optional().default({}),
  social_links: z.record(z.string(), z.string()).optional().default({}),
  photos: z.array(z.string()).optional().default([]),
  /** Separate from `photos` (the real gallery) — a wide/landscape stock photo for the hero banner when
   *  none of the client's own photos are the right shape. Never mixed into the real-work gallery. */
  hero_photo: z.string().optional(),
  menu_or_services: z.array(MenuItemSchema).optional().default([]),
  /** Shown under the services heading when the list is known to be a partial pull (e.g. the source only
   *  exposes a "popular" subset) — keeps the site honest instead of implying this is the full price list. */
  services_note: z.string().optional(),
  reviews: z.array(ReviewSchema).optional().default([]),
  reviews_url: z.string().optional(),
  map_coords: z.object({ lat: z.number(), lng: z.number() }).optional(),
  /** Instructors / barbers / doctors — a team roster shown on the site, if the client wants one. */
  team: z.array(TeamMemberSchema).optional().default([]),
  /** Numbered steps explaining how the service/process works (e.g. learning stages, treatment stages). */
  process_steps: z.array(ProcessStepSchema).optional().default([]),
  faq: z.array(FaqItemSchema).optional().default([]),
  /** Short trust-building numbers, e.g. { value: "12 лет", label: "на рынке" }. */
  stats: z.array(StatSchema).optional().default([]),
  /** Signature dishes/products worth a dedicated showcase, separate from the full menu/services list. */
  highlights: z.array(HighlightItemSchema).optional().default([]),
  /** Store catalog — the core of a marketplace-seller site. Ignored by the service-business templates. */
  products: z.array(ProductSchema).optional().default([]),
  /** WB / Ozon / Яндекс Маркет storefronts with their public ratings — the trust anchor for a seller site. */
  marketplaces: z.array(MarketplaceSchema).optional().default([]),
  /** Shipping + payment terms: drives the СДЭК estimate and the checkout. */
  delivery: DeliverySchema.optional(),
  /** Link to an existing online booking widget (YClients, Dikidi, etc.). When present, it replaces the built-in contact form — no point offering a fake form next to a real booking system. */
  booking_url: z.string().optional(),
  /** Explicit copy. Anything set here overrides what Claude wrote (or the dry-run placeholder),
   *  field by field — for clients who dictate their own wording, and so a portfolio demo can be
   *  built without an API key and still read like finished copy rather than a placeholder. */
  copy: z
    .object({
      meta: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
      hero: z.object({ heading: z.string().optional(), subheading: z.string().optional(), ctaLabel: z.string().optional() }).optional(),
      about: z.object({ heading: z.string().optional(), body: z.string().optional() }).optional(),
    })
    .optional(),
  /** Explicit design curation: pin a palette (tokenSetIndex) and/or exact section variants.
   *  When absent, the variance engine picks from the seed as usual. Used to guarantee that
   *  sibling sites in a portfolio look genuinely different rather than seeded-similar. */
  design: z
    .object({
      tokenSetIndex: z.number().int().min(0).optional(),
      sections: z.array(z.object({ id: z.string(), variant: z.number().int().min(0) })).optional(),
    })
    .optional(),
});
export type Brief = z.infer<typeof BriefSchema>;

export const GeneratedContentSchema = z.object({
  meta: z.object({
    title: z.string(),
    description: z.string(),
  }),
  hero: z.object({
    heading: z.string(),
    subheading: z.string(),
    ctaLabel: z.string(),
  }),
  about: z.object({
    heading: z.string(),
    body: z.string(),
  }),
  items: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional().default(""),
      price: z.union([z.string(), z.number()]).optional(),
      category: z.string().optional(),
      photo: z.string().optional(),
    })
  ),
  gallery: z.array(
    z.object({
      src: z.string(),
      alt: z.string(),
    })
  ),
  reviews: z.array(ReviewSchema),
  /** Catalog copy for store templates: same products as the brief, descriptions rewritten.
   *  Absent for every other business type, so it stays optional. */
  products: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional().default(""),
      })
    )
    .optional(),
});
export type GeneratedContent = z.infer<typeof GeneratedContentSchema>;

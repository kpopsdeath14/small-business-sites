import { z } from "zod";

export const BusinessTypeSchema = z.enum(["restaurant", "autoschool", "barbershop", "dental-clinic", "bakery", "beauty-salon", "tattoo-studio"]);
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
  /** Link to an existing online booking widget (YClients, Dikidi, etc.). When present, it replaces the built-in contact form — no point offering a fake form next to a real booking system. */
  booking_url: z.string().optional(),
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
});
export type GeneratedContent = z.infer<typeof GeneratedContentSchema>;

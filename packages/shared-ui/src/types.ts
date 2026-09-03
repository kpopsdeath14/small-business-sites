/** CSS custom property values, e.g. { "--color-primary": "#C1440E" }. Every template's token sets share this shape. */
export type DesignTokens = Record<string, string>;

export interface SiteData {
  name: string;
  meta: { title: string; description: string };
  hero: { heading: string; subheading: string; ctaLabel: string };
  about: { heading: string; body: string };
  items: { name: string; description?: string; price?: string | number; category?: string; photo?: string }[];
  /** Shown under the services heading when `items` is a known-partial pull from the source. */
  servicesNote?: string;
  gallery: { src: string; alt: string }[];
  /** Optional wide/landscape photo for the hero banner, kept separate from the real-work `gallery`. */
  heroPhoto?: string;
  reviews: { author: string; rating: number; text: string }[];
  /** Link to the business's Google/Yandex Maps review page, so visitors leave reviews there instead of on the static site. */
  reviewsUrl?: string;
  address?: string;
  phone?: string;
  workingHours?: Record<string, string>;
  socialLinks?: Record<string, string>;
  mapCoords?: { lat: number; lng: number };
  /** Instructors / barbers / doctors — a team roster shown on the site, if the client wants one. */
  team: { name: string; role?: string; bio?: string; photo?: string }[];
  /** Numbered steps explaining how the service/process works. */
  processSteps: { title: string; description?: string }[];
  faq: { question: string; answer: string }[];
  stats: { value: string; label: string }[];
  /** Signature dishes/products worth a dedicated showcase, separate from the full menu/services list. */
  highlights: { name: string; description?: string; price?: string | number; photo?: string }[];
  /** Existing online booking widget (YClients, Dikidi, etc.) — replaces the built-in contact form when set. */
  bookingUrl?: string;
  /** Store catalog (marketplace-seller sites). Prices are numbers so the cart can add them up. */
  products: StoreProduct[];
  /** The seller's WB / Ozon / Яндекс Маркет storefronts, with their public ratings. */
  marketplaces: { name: string; url: string; rating?: number; reviewsCount?: number; note?: string }[];
  /** Shipping + payment terms driving the СДЭК estimate and the checkout flow. */
  delivery?: StoreDelivery;
}

export interface StoreProduct {
  /** Stable slug derived from the name — the cart line key and the DOM id of the card. */
  id: string;
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  category?: string;
  photo?: string;
  badge?: string;
  rating?: number;
  reviewsCount?: number;
  sku?: string;
  inStock: boolean;
  weightKg?: number;
  specs: [string, string][];
}

export interface StoreDelivery {
  freeFrom?: number;
  basePrice?: number;
  processingDays?: string;
  note?: string;
  pickupPoints: { city: string; address: string; hours?: string; note?: string }[];
  /** Resolved by the pipeline: where "оформить заказ" sends the composed order. */
  orderChannel?: "whatsapp" | "telegram" | "email";
  orderContact?: string;
  paymentMethods: string[];
}

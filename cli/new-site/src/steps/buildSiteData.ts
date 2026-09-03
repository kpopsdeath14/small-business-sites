import type { Brief, GeneratedContent } from "@sitegen/content-gen";
import type { SiteData, StoreDelivery, StoreProduct } from "@sitegen/shared-ui/types.ts";
import { slugify } from "../utils/slug.js";

/** Default СДЭК base tariff (zone 1) when the seller has no figure of their own. */
const DEFAULT_BASE_SHIPPING = 290;
const DEFAULT_PAYMENT_METHODS = ["Картой онлайн", "СБП по QR-коду", "При получении"];

/**
 * Where a submitted order goes. A messenger the seller already reads beats a form that posts
 * into a void, so WhatsApp/Telegram win over email whenever the brief has one — unless the
 * brief pins `delivery.order_channel` explicitly.
 */
function resolveOrderChannel(brief: Brief): Pick<StoreDelivery, "orderChannel" | "orderContact"> {
  const social = brief.social_links ?? {};
  const explicit = brief.delivery?.order_channel;
  const contactOverride = brief.delivery?.order_contact;

  const candidates: { channel: StoreDelivery["orderChannel"]; contact?: string }[] = [
    { channel: "whatsapp", contact: social.whatsapp || (brief.phone ? `https://wa.me/${brief.phone.replace(/[^\d]/g, "")}` : undefined) },
    { channel: "telegram", contact: social.telegram },
    { channel: "email", contact: social.email },
  ];

  if (explicit) {
    const match = candidates.find((c) => c.channel === explicit);
    return { orderChannel: explicit, orderContact: contactOverride ?? match?.contact };
  }
  const first = candidates.find((c) => !!c.contact);
  return first ? { orderChannel: first.channel, orderContact: contactOverride ?? first.contact } : { orderContact: contactOverride };
}

/**
 * Catalog products get a stable, human-readable id (`polotentse-vaflnoe-3`): it keys cart lines in
 * localStorage, so it must survive a rebuild — an array index would silently re-point a saved cart
 * at a different product as soon as the seller inserts a row. The index suffix keeps duplicate
 * names apart.
 */
function buildProducts(brief: Brief, content: GeneratedContent): StoreProduct[] {
  const copy = content.products ?? [];
  return brief.products.map((product, i) => ({
    id: `${slugify(product.name)}-${i}`,
    name: copy[i]?.name || product.name,
    description: copy[i]?.description ?? product.description,
    price: product.price,
    oldPrice: product.old_price && product.old_price > product.price ? product.old_price : undefined,
    category: product.category,
    photo: product.photo,
    badge: product.badge,
    rating: product.rating,
    reviewsCount: product.reviews_count,
    sku: product.sku,
    inStock: product.in_stock,
    weightKg: product.weight_kg,
    specs: product.specs,
  }));
}

function buildDelivery(brief: Brief): StoreDelivery | undefined {
  if (!brief.delivery && brief.products.length === 0) return undefined;
  const delivery = brief.delivery;
  return {
    freeFrom: delivery?.free_from,
    basePrice: delivery?.base_price ?? DEFAULT_BASE_SHIPPING,
    processingDays: delivery?.processing_days,
    note: delivery?.note,
    pickupPoints: delivery?.pickup_points ?? [],
    paymentMethods: delivery?.payment_methods?.length ? delivery.payment_methods : DEFAULT_PAYMENT_METHODS,
    ...resolveOrderChannel(brief),
  };
}

export function buildSiteData(
  brief: Brief,
  content: GeneratedContent,
  localPhotoPaths: string[],
  heroPhoto?: string
): SiteData {
  return {
    name: brief.name,
    meta: content.meta,
    hero: content.hero,
    about: content.about,
    items: content.items,
    servicesNote: brief.services_note,
    gallery: content.gallery.map((photo, i) => ({
      ...photo,
      src: localPhotoPaths[i] ?? photo.src,
    })),
    heroPhoto,
    reviews: content.reviews,
    reviewsUrl: brief.reviews_url,
    address: brief.address,
    phone: brief.phone,
    workingHours: brief.working_hours,
    socialLinks: brief.social_links,
    mapCoords: brief.map_coords,
    team: brief.team,
    processSteps: brief.process_steps,
    faq: brief.faq,
    stats: brief.stats,
    highlights: brief.highlights,
    bookingUrl: brief.booking_url,
    products: buildProducts(brief, content),
    marketplaces: brief.marketplaces.map((m) => ({
      name: m.name,
      url: m.url,
      rating: m.rating,
      reviewsCount: m.reviews_count,
      note: m.note,
    })),
    delivery: buildDelivery(brief),
  };
}

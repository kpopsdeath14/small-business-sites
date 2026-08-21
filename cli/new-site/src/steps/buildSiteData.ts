import type { Brief, GeneratedContent } from "@sitegen/content-gen";
import type { SiteData } from "@sitegen/shared-ui/types.ts";

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
  };
}

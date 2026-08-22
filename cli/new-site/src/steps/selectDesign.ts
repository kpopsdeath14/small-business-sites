import { selectSiteConfig, type SiteConfig, type BusinessManifest } from "@sitegen/variance-engine";
import type { DesignTokens } from "@sitegen/shared-ui/types.ts";
import type { Brief } from "@sitegen/content-gen";
import { loadTemplateModule } from "../utils/templateRegistry.js";

export interface DesignSelection {
  siteConfig: SiteConfig;
  tokens: DesignTokens;
}

/**
 * Optional sections only make sense when the brief actually has data for them — otherwise the
 * variance engine could pick e.g. "team" for a client with no team members and render an empty
 * section. Sections not listed here (hero, about, the core offering, contact, footer) are always
 * considered available; whether they show up is purely down to `required`/`probability`.
 */
const DATA_AVAILABILITY: Record<string, (brief: Brief) => boolean> = {
  gallery: (b) => b.photos.length > 0,
  reviews: (b) => b.reviews.length > 0 || !!b.reviews_url,
  team: (b) => b.team.length > 0,
  process: (b) => b.process_steps.length > 0,
  faq: (b) => b.faq.length > 0,
  stats: (b) => b.stats.length > 0,
  highlights: (b) => b.highlights.length > 0,
};

function withAvailableSections(manifest: BusinessManifest, brief: Brief): BusinessManifest {
  return {
    ...manifest,
    sections: manifest.sections.filter((section) => {
      const isAvailable = DATA_AVAILABILITY[section.id];
      return isAvailable ? isAvailable(brief) : true;
    }),
  };
}

export async function selectDesign(brief: Brief): Promise<DesignSelection> {
  const { manifest, tokenSets } = await loadTemplateModule(brief.business_type);
  const seed = brief.seed ?? brief.name;

  // Explicit curation wins: a brief may pin the palette and/or exact section variants
  // (see BriefSchema.design). Anything not pinned still falls through to the engine.
  if (brief.design?.tokenSetIndex !== undefined || brief.design?.sections) {
    const curated: SiteConfig = {
      ...selectSiteConfig(withAvailableSections(manifest, brief), seed),
      ...(brief.design.tokenSetIndex !== undefined ? { tokenSetIndex: brief.design.tokenSetIndex } : {}),
      ...(brief.design.sections ? { sections: brief.design.sections } : {}),
    };
    const tokenIndex = Math.min(curated.tokenSetIndex, tokenSets.length - 1);
    return { siteConfig: { ...curated, tokenSetIndex: tokenIndex }, tokens: tokenSets[tokenIndex] };
  }

  const siteConfig = selectSiteConfig(withAvailableSections(manifest, brief), seed);
  const tokens = tokenSets[siteConfig.tokenSetIndex];
  return { siteConfig, tokens };
}

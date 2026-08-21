export interface SectionManifestEntry {
  /** Section id, must match a key the template's page renderer knows about, e.g. "hero", "gallery". */
  id: string;
  /** How many layout variants exist for this section in the template. */
  variants: number;
  /** Always included when true (default). When false, included based on `probability`. */
  required?: boolean;
  /** Chance [0,1] the section is included when not required. Default 0.5. */
  probability?: number;
  /** Sections pinned to the start/end keep their relative order; "middle" sections get shuffled. */
  position?: "start" | "middle" | "end";
  /** Fixes this section's place among the "middle" sections instead of shuffling it. Only takes effect
   *  when every middle section in the manifest defines one — a partial mix would be ambiguous, so in
   *  that case the whole middle group falls back to the normal shuffle. */
  order?: number;
}

export interface BusinessManifest {
  businessType: string;
  /** Number of design-token sets available for this business type. */
  tokenSetCount: number;
  sections: SectionManifestEntry[];
}

export interface SelectedSection {
  id: string;
  variant: number;
}

export interface SiteConfig {
  seed: string;
  tokenSetIndex: number;
  sections: SelectedSection[];
}

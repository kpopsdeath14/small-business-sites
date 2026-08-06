import type { BusinessType } from "@sitegen/content-gen";
import type { BusinessManifest, SiteConfig } from "@sitegen/variance-engine";
import type { DesignTokens } from "@sitegen/shared-ui/types.ts";

export interface TemplateModule {
  manifest: BusinessManifest;
  tokenSets: DesignTokens[];
}

const PACKAGE_NAMES: Record<BusinessType, string> = {
  restaurant: "@sitegen/template-restaurant",
  autoschool: "@sitegen/template-autoschool",
  barbershop: "@sitegen/template-barbershop",
  "dental-clinic": "@sitegen/template-dental-clinic",
  bakery: "@sitegen/template-bakery",
  "beauty-salon": "@sitegen/template-beauty-salon",
};

/** Absolute path (relative to this file) to each template's `astro-project` skeleton, for scaffolding. */
export function templatePackageName(businessType: BusinessType): string {
  return PACKAGE_NAMES[businessType];
}

export async function loadTemplateModule(businessType: BusinessType): Promise<TemplateModule> {
  const pkg = PACKAGE_NAMES[businessType];
  const mod = (await import(pkg)) as TemplateModule;
  return mod;
}

export type { SiteConfig };

import { generateContent as generate, type Brief, type GeneratedContent } from "@sitegen/content-gen";

export interface GenerateContentOptions {
  dryRun?: boolean;
}

export async function generateContentStep(brief: Brief, options: GenerateContentOptions = {}): Promise<GeneratedContent> {
  return generate(brief, options);
}

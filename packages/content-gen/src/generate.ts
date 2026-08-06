import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { GeneratedContentSchema, type Brief, type GeneratedContent } from "./schema.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = path.join(__dirname, "prompts");
const MODEL = "claude-sonnet-5";

const BUSINESS_TYPE_LABELS: Record<Brief["business_type"], string> = {
  restaurant: "ресторан / кафе",
  autoschool: "автошкола",
  barbershop: "барбершоп / парикмахерская",
  "dental-clinic": "стоматология / медклиника",
  bakery: "кофейня / пекарня",
  "beauty-salon": "салон красоты / студия красоты",
};

function loadPrompt(file: string, vars: Record<string, string>): string {
  let template = fs.readFileSync(path.join(PROMPTS_DIR, file), "utf-8");
  for (const [key, value] of Object.entries(vars)) {
    template = template.replaceAll(`{{${key}}}`, value || "(нет данных)");
  }
  return template;
}

function briefToVars(brief: Brief): Record<string, string> {
  return {
    name: brief.name,
    business_type: BUSINESS_TYPE_LABELS[brief.business_type],
    description_raw: brief.description_raw,
    address: brief.address,
    phone: brief.phone,
    working_hours: JSON.stringify(brief.working_hours),
    menu_or_services: JSON.stringify(brief.menu_or_services),
    reviews: JSON.stringify(brief.reviews),
    photos: JSON.stringify(brief.photos),
  };
}

async function callClaude(client: Anthropic, prompt: string): Promise<unknown> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Claude не вернул JSON. Ответ: ${text.slice(0, 300)}`);
  }
  return JSON.parse(jsonMatch[0]);
}

export interface GenerateOptions {
  /** Force dry-run even if ANTHROPIC_API_KEY is set. */
  dryRun?: boolean;
}

export async function generateContent(brief: Brief, options: GenerateOptions = {}): Promise<GeneratedContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const dryRun = options.dryRun || !apiKey;

  const content = dryRun ? dryRunContent(brief) : await liveGenerate(brief, apiKey!);
  return GeneratedContentSchema.parse(content);
}

async function liveGenerate(brief: Brief, apiKey: string): Promise<GeneratedContent> {
  const client = new Anthropic({ apiKey });
  const vars = briefToVars(brief);

  const [meta, hero, about, itemsResult, altsResult, reviewsResult] = await Promise.all([
    callClaude(client, loadPrompt("seo-meta.md", vars)) as Promise<{ title: string; description: string }>,
    callClaude(client, loadPrompt("hero.md", vars)) as Promise<{ heading: string; subheading: string; ctaLabel: string }>,
    callClaude(client, loadPrompt("about.md", vars)) as Promise<{ heading: string; body: string }>,
    brief.menu_or_services.length > 0
      ? (callClaude(client, loadPrompt("services-or-menu.md", vars)) as Promise<{ items: GeneratedContent["items"] }>)
      : Promise.resolve({ items: [] }),
    brief.photos.length > 0
      ? (callClaude(client, loadPrompt("photo-alt.md", vars)) as Promise<{ alts: string[] }>)
      : Promise.resolve({ alts: [] }),
    brief.reviews.length > 0
      ? (callClaude(client, loadPrompt("reviews-format.md", vars)) as Promise<{ reviews: GeneratedContent["reviews"] }>)
      : Promise.resolve({ reviews: [] }),
  ]);

  return {
    meta,
    hero,
    about,
    items: itemsResult.items,
    gallery: brief.photos.map((src, i) => ({ src, alt: altsResult.alts[i] ?? brief.name })),
    reviews: reviewsResult.reviews.length > 0 ? reviewsResult.reviews : brief.reviews,
  };
}

function truncateAtWord(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input;
  const truncated = input.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated}…`;
}

function dryRunContent(brief: Brief): GeneratedContent {
  const draftTag = "[ЧЕРНОВИК] ";
  const typeLabel = BUSINESS_TYPE_LABELS[brief.business_type];

  return {
    meta: {
      title: `${brief.name} — ${typeLabel}`,
      description: draftTag + (brief.description_raw || `${brief.name}: подробности скоро.`),
    },
    hero: {
      heading: brief.name,
      subheading: draftTag + (truncateAtWord(brief.description_raw, 140) || "Добро пожаловать!"),
      ctaLabel: "Связаться с нами",
    },
    about: {
      heading: "О нас",
      body: draftTag + (brief.description_raw || "Расскажем о себе подробнее совсем скоро."),
    },
    items: brief.menu_or_services.map((item) => ({
      name: item.name,
      description: draftTag + (item.description || ""),
      price: item.price,
      category: item.category,
    })),
    gallery: brief.photos.map((src, i) => ({ src, alt: `${brief.name} — фото ${i + 1}` })),
    reviews: brief.reviews,
  };
}

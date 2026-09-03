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
  "tattoo-studio": "тату-студия / тату-мастер",
  "marketplace-store": "интернет-магазин продавца на маркетплейсах (Wildberries / Ozon)",
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
    products: JSON.stringify(brief.products.map(({ name, description, category }) => ({ name, description, category }))),
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
  return GeneratedContentSchema.parse(applyCopyOverrides(brief, content));
}

async function liveGenerate(brief: Brief, apiKey: string): Promise<GeneratedContent> {
  const client = new Anthropic({ apiKey });
  const vars = briefToVars(brief);

  const [meta, hero, about, itemsResult, altsResult, reviewsResult, productsResult] = await Promise.all([
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
    // Store templates only: catalog copy. Prices/photos never round-trip through Claude —
    // only names and one-line descriptions do, so a hallucinated number can't reach a price tag.
    brief.products.length > 0
      ? (callClaude(client, loadPrompt("products.md", vars)) as Promise<{ products: { name: string; description?: string }[] }>)
      : Promise.resolve({ products: [] }),
  ]);

  return {
    meta,
    hero,
    about,
    items: itemsResult.items.map((item, i) => ({ ...item, photo: brief.menu_or_services[i]?.photo })),
    gallery: brief.photos.map((src, i) => ({ src, alt: altsResult.alts[i] ?? brief.name })),
    reviews: reviewsResult.reviews.length > 0 ? reviewsResult.reviews : brief.reviews,
    // Only accept the rewrite when Claude returned exactly one entry per product — a short or
    // reordered list would silently mislabel items, so fall back to the brief's own copy.
    products:
      productsResult.products.length === brief.products.length
        ? productsResult.products.map((p, i) => ({ name: p.name || brief.products[i].name, description: p.description ?? "" }))
        : brief.products.map((p) => ({ name: p.name, description: p.description })),
  };
}

/** Field-by-field override from `brief.copy`; anything the brief leaves out keeps the generated
 *  (or placeholder) value, so a brief can pin just the headline and leave the rest to Claude. */
function applyCopyOverrides(brief: Brief, content: GeneratedContent): GeneratedContent {
  const copy = brief.copy;
  if (!copy) return content;
  return {
    ...content,
    meta: { ...content.meta, ...stripUndefined(copy.meta) },
    hero: { ...content.hero, ...stripUndefined(copy.hero) },
    about: { ...content.about, ...stripUndefined(copy.about) },
  };
}

function stripUndefined<T extends object>(value: T | undefined): Partial<T> {
  if (!value) return {};
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;
}

function truncateAtWord(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input;
  const truncated = input.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated}…`;
}

/** Prefers cutting at the end of a full sentence (so short descriptions built from
 *  "{category}. {address}. Работает {hours}." pass through untouched, and only genuinely
 *  long ones get shortened) instead of chopping mid-sentence and tacking on an ellipsis.
 *  Falls back to word-boundary truncation when no clean sentence break exists in range. */
function truncateAtSentence(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input;
  const window = input.slice(0, maxLength);
  const sentenceEnd = /\.\s(?=[А-ЯЁA-Z])/g;
  let lastCut = -1;
  let match: RegExpExecArray | null;
  while ((match = sentenceEnd.exec(window))) {
    lastCut = match.index + 1;
  }
  if (lastCut >= 20) return input.slice(0, lastCut);
  return truncateAtWord(input, maxLength);
}

function dryRunContent(brief: Brief): GeneratedContent {
  const typeLabel = BUSINESS_TYPE_LABELS[brief.business_type];

  return {
    meta: {
      title: `${brief.name} — ${typeLabel}`,
      description: brief.description_raw || `${brief.name}: подробности скоро.`,
    },
    hero: {
      heading: brief.name,
      subheading: truncateAtSentence(brief.description_raw, 115) || "Добро пожаловать!",
      ctaLabel: brief.business_type === "marketplace-store" ? "Перейти в каталог" : "Связаться с нами",
    },
    about: {
      heading: brief.business_type === "marketplace-store" ? "О бренде" : "О нас",
      body: brief.description_raw || "Расскажем о себе подробнее совсем скоро.",
    },
    items: brief.menu_or_services.map((item) => ({
      name: item.name,
      description: item.description || "",
      price: item.price,
      category: item.category,
      photo: item.photo,
    })),
    gallery: brief.photos.map((src, i) => ({ src, alt: `${brief.name} — фото ${i + 1}` })),
    reviews: brief.reviews,
    products: brief.products.map((product) => ({ name: product.name, description: product.description })),
  };
}

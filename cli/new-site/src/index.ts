import { parseArgs } from "node:util";
import path from "node:path";
import { validateBrief } from "./steps/validateBrief.js";
import { selectDesign } from "./steps/selectDesign.js";
import { generateContentStep } from "./steps/generateContent.js";
import { readContentCache, writeContentCache } from "./steps/contentCache.js";
import { hashBrief } from "./utils/hash.js";
import { downloadImages, downloadPhotoFields, downloadSinglePhoto } from "./steps/downloadImages.js";
import { buildSiteData } from "./steps/buildSiteData.js";
import { scaffoldSite } from "./steps/scaffoldSite.js";
import { writeSiteFiles } from "./steps/writeSiteFiles.js";
import { linkWorkspace, buildSite } from "./steps/buildSite.js";
import { slugify } from "./utils/slug.js";
import { step, info, success } from "./utils/logger.js";

const { values } = parseArgs({
  options: {
    brief: { type: "string" },
    type: { type: "string" },
    "dry-run": { type: "boolean", default: false },
    "regenerate-content": { type: "boolean", default: false },
    seed: { type: "string" },
    base: { type: "string", default: "/" },
  },
});

if (!values.brief || !values.type) {
  console.error(
    "Использование: npm run new-site -- --brief=<путь до JSON> --type=<restaurant|autoschool|barbershop|dental-clinic|bakery> [--dry-run] [--regenerate-content] [--seed=...]"
  );
  process.exit(1);
}

const repoRoot = process.cwd();

async function main() {
  step("Валидация брифа");
  const brief = await validateBrief(path.resolve(values.brief!));
  if (values.seed) brief.seed = values.seed;
  if (brief.business_type !== values.type) {
    throw new Error(`--type=${values.type} не совпадает с business_type="${brief.business_type}" в брифе`);
  }
  info(`Клиент: ${brief.name} (${brief.business_type})`);

  const slug = slugify(brief.name);
  info(`Slug: ${slug}`);

  step("Выбор дизайна (design tokens + варианты секций)");
  const { siteConfig, tokens } = await selectDesign(brief);
  info(`Seed: ${siteConfig.seed}, набор токенов #${siteConfig.tokenSetIndex}`);
  info(`Секции: ${siteConfig.sections.map((s) => `${s.id}(${s.variant})`).join(", ")}`);

  step("Генерация текстового контента");
  const dryRun = values["dry-run"] || !process.env.ANTHROPIC_API_KEY;
  const briefHash = hashBrief(brief);
  // Dry-run placeholder content is never cached/reused — only real Claude output is worth saving an API call for.
  const cachedContent = dryRun || values["regenerate-content"] ? null : await readContentCache(repoRoot, slug, briefHash);
  let content;
  if (cachedContent) {
    info("Бриф не менялся с прошлого запуска — использую закешированный контент (без обращения к Claude).");
    content = cachedContent;
  } else {
    if (dryRun) info("Режим dry-run: ANTHROPIC_API_KEY не задан или указан --dry-run — использую черновой контент.");
    content = await generateContentStep(brief, { dryRun });
    if (!dryRun) await writeContentCache(repoRoot, slug, briefHash, content);
  }

  step("Подготовка Astro-проекта клиента");
  const { siteDir, isNewSite } = await scaffoldSite(brief.business_type, slug, repoRoot);

  step("Скачивание фото");
  const basePath = values.base!;
  const localPhotoPaths = await downloadImages(brief.photos, siteDir, basePath);
  const optimizedHighlights = await downloadPhotoFields(brief.highlights, siteDir, "highlight", basePath);
  const optimizedTeam = await downloadPhotoFields(brief.team, siteDir, "team", basePath);
  content.items = await downloadPhotoFields(content.items, siteDir, "item", basePath);
  const heroPhoto = brief.hero_photo ? await downloadSinglePhoto(brief.hero_photo, siteDir, "hero", basePath) : undefined;

  const siteData = buildSiteData(
    { ...brief, highlights: optimizedHighlights, team: optimizedTeam },
    content,
    localPhotoPaths,
    heroPhoto
  );
  await writeSiteFiles(siteDir, siteData, siteConfig, tokens);
  success(`Данные сайта записаны в sites/${slug}`);

  if (isNewSite) {
    step("Линковка нового воркспейса (npm install)");
    await linkWorkspace(repoRoot);
  }

  step("Локальная сборка (astro build)");
  const distDir = await buildSite(siteDir);
  success(`Готово! Сайт собран: ${distDir}`);
  info(`Просмотр: cd sites/${slug} && npx astro preview`);
  info(`Деплой на хостинг пока не подключён — добавим отдельным шагом, когда решим вопрос с хостингом.`);
}

main().catch((err) => {
  console.error("\n✘ Ошибка:", err instanceof Error ? err.message : err);
  process.exit(1);
});

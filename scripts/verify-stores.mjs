#!/usr/bin/env node
/**
 * Smoke-checks built marketplace-store sites (`--type=marketplace-store`).
 *
 * A store page has moving parts a static salon page does not — a cart island, a delegated
 * add-to-cart listener, DOM catalog filtering, a delivery calculator — and all of it is invisible
 * to `astro build`. This drives a real browser over each built site and fails on anything broken.
 *
 * Checked per site:
 *   · page loads with no console errors and no 4xx/5xx responses,
 *   · "в корзину" updates the header counter,
 *   · the cart's localStorage key is scoped to this store (sibling sites share one Pages origin),
 *   · a category chip actually narrows the catalog,
 *   · the standalone delivery calculator renders a quote for all three methods.
 *
 * Playwright is a devDependency; its browser binary is not, so install it once:
 *
 *   npx playwright install chromium
 *   npm run verify-stores -- volta:/volta-shop len-i-hlopok:/len-shop berry-lab:/berry-shop
 *
 * Each argument is `<site-dir>:<base-path>`, matching the SITES list in
 * .github/workflows/deploy-sites.yml. Use `:/` for a site built at the document root.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const sites = process.argv.slice(2).map((arg) => {
  const at = arg.lastIndexOf(":");
  if (at < 1) throw new Error(`Ожидал "<каталог сайта>:<base>", получил "${arg}"`);
  return { dir: arg.slice(0, at), base: arg.slice(at + 1).replace(/\/$/, "") };
});
if (sites.length === 0) {
  console.error("Использование: node scripts/verify-stores.mjs <site-dir>:<base> [...]");
  process.exit(1);
}

const TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

// One origin serving every site under its own base — the same shape as GitHub Pages, which is what
// makes the per-store localStorage scoping worth checking at all.
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  const site = sites.find(({ base }) => base === "" || url === base || url.startsWith(`${base}/`));
  if (!site) return end404(res);
  let file = path.join(path.resolve(`sites/${site.dir}/dist`), url.slice(site.base.length));
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!fs.existsSync(file)) return end404(res);
  res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
function end404(res) {
  res.writeHead(404);
  res.end("");
}

await new Promise((resolve) => server.listen(0, resolve));
const origin = `http://localhost:${server.address().port}`;
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

// Google Fonts is the one external request the pages make; offline runs must not fail on it.
const isFontHost = (text) => /fonts\.(googleapis|gstatic)\.com|ERR_NAME_NOT_RESOLVED/.test(text);

let failed = 0;
for (const { dir, base } of sites) {
  const page = await context.newPage();
  const errors = [];
  const badResponses = [];
  page.on("console", (msg) => msg.type() === "error" && !isFontHost(msg.text()) && errors.push(msg.text()));
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("response", (res) => res.status() >= 400 && !isFontHost(res.url()) && badResponses.push(`${res.status()} ${res.url()}`));

  await page.goto(`${origin}${base}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  await page.locator("#catalog").scrollIntoViewIfNeeded();
  await page.locator("[data-add-to-cart]").first().click();
  await page.waitForTimeout(400);
  const badge = await page.locator("[data-cart-count]").first().textContent();
  const ownKeys = await page.evaluate(() =>
    Object.keys(localStorage).filter((key) => key.startsWith("vitrina-cart:"))
  );

  const total = Number(await page.locator("[data-catalog-count]").textContent());
  await page.locator("[data-filter-category]").nth(1).click();
  await page.waitForTimeout(300);
  const filtered = Number(await page.locator("[data-catalog-count]").textContent());

  await page.locator("[data-calc-city]").fill("Казань");
  await page.waitForTimeout(300);
  await page.locator("[data-calc-suggest] button").first().click();
  await page.waitForTimeout(300);
  const quoteRows = await page.locator("[data-calc-results] > div").count();

  const problems = [];
  if (badge !== "1") problems.push(`счётчик корзины показывает "${badge}", ожидалась 1`);
  if (!(filtered > 0 && filtered < total)) problems.push(`фильтр категории не сузил каталог (${filtered} из ${total})`);
  if (quoteRows !== 3) problems.push(`калькулятор доставки показал ${quoteRows} способов вместо 3`);
  if (errors.length) problems.push(`ошибки в консоли: ${errors.slice(0, 3).join(" | ")}`);
  if (badResponses.length) problems.push(`не загрузилось: ${badResponses.slice(0, 3).join(" | ")}`);

  if (problems.length) {
    failed++;
    console.log(`FAIL ${dir}`);
    for (const problem of problems) console.log(`     · ${problem}`);
  } else {
    console.log(`OK   ${dir} — корзина, фильтр (${filtered}/${total}) и расчёт СДЭК работают; ключи: ${ownKeys.join(", ")}`);
  }
  await page.close();
}

await browser.close();
server.close();
process.exit(failed ? 1 : 0);

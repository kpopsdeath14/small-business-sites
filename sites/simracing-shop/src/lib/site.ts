import catalog from "../data/catalog.json";

export type Variant = {
  id: string;
  label: string;
  labelRu: string;
  swatch: string[];
  price: number;
  stock: "in" | "pre";
  img: string[];
};
export type Product = {
  slug: string;
  name: string;
  cat: string;
  sub: string;
  from: number;
  features: { t: string; d: string }[];
  sections: { t: string; h: string }[];
  faq: { q: string; a: string }[];
  variants: Variant[];
};
export type Category = { id: string; title: string; note: string };

export const products = catalog.products as Product[];
export const categories = (catalog.categories as Category[]).filter((c) => products.some((p) => p.cat === c.id));
export const bySlug = (s: string) => products.find((p) => p.slug === s)!;
export const catTitle = (id: string) => categories.find((c) => c.id === id)?.title ?? "";

export const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
export const url = (path = "") => `${BASE}/${path.replace(/^\//, "")}`;
export const pimg = (id: string, w: 600 | 1200 = 600) => `${BASE}/p/${id}-${w}.webp`;
export const img = (name: string, w: number) => `${BASE}/img/${name}-${w}.webp`;
export const srcset = (name: string, ws: number[]) => ws.map((w) => `${img(name, w)} ${w}w`).join(", ");

export const rub = (n: number) => n.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽";

export const contacts = {
  phone: "+7 (926) 557-82-10",
  phoneHref: "tel:+79265578210",
  whatsapp: "79265578210",
  email: "Info@Simracing-shop.ru",
  instagram: "https://www.instagram.com/rseat_russia/",
  youtube: "https://www.youtube.com/channel/UCmOTiVxr0JgeeMGvs2qYHIw/videos",
  tiktok: "https://www.tiktok.com/@rseat",
  manager: "Илья Вихарев",
  locations: [
    { city: "Москва", kind: "Офис и шоурум", address: "ул. Рябиновая, 32" },
    { city: "Самара", kind: "Демо-зал", address: "Южное шоссе, 5" },
  ],
};
export const wa = (text: string) => `https://wa.me/${contacts.whatsapp}?text=${encodeURIComponent(text)}`;

/** Compact client-side index for the cart: variant id → display data. */
export const cartIndex = Object.fromEntries(
  products.flatMap((p) =>
    p.variants.map((v) => [
      v.id,
      { n: p.name, v: v.labelRu, p: v.price, i: v.img[0] ?? "", s: p.slug, st: v.stock },
    ]),
  ),
);

/**
 * Footprints from the client's product pages (mm). `l`/`w` may be ranges [min, max]
 * (seat rails / adjustable stand). Only products with explicit figures are listed.
 */
export const DIMS: Record<string, { l: [number, number]; w: [number, number]; h?: string }> = {
  "a1-pro-formula": { l: [1425, 1750], w: [660, 660] },
  "a1-pro-gt": { l: [1425, 1750], w: [660, 660] },
  "rs-formula-v2": { l: [1950, 2150], w: [620, 620], h: "980" },
  p1: { l: [1680, 1750], w: [600, 600] },
  rs1: { l: [1815, 1815], w: [640, 640], h: "1305" },
  "rs-formula-turnkey": { l: [1950, 2150], w: [620, 1300], h: "980" },
  "rs-formula-m4a-full-motion": { l: [2000, 2200], w: [800, 800], h: "940" },
  "rs-stand-t3xl": { l: [2700, 2700], w: [900, 900], h: "1100–1350" },
  "rs-stand-s3": { l: [1350, 1350], w: [685, 685], h: "1000–1250" },
};

/** Builder's plate details for RSEAT-made products. */
export const PLATE: Record<string, { line: string; warranty: string }> = {
  "a1-pro-formula": { line: "ALU 6063-T6 · FORMULA", warranty: "5 YRS" },
  "a1-pro-gt": { line: "ALU 6063-T6 · GT", warranty: "5 YRS" },
  p1: { line: "TUBULAR FRAME · GT", warranty: "5 YRS" },
  "p1-sparco": { line: "TUBULAR FRAME · SPARCO", warranty: "2 YRS" },
  c1: { line: "TUBULAR FRAME · SPARCO", warranty: "2 YRS" },
  b1: { line: "MODULAR PLATFORM", warranty: "2 YRS" },
  "rs-formula-v2": { line: "FORMULA POSITION", warranty: "2 YRS" },
  s1: { line: "STEEL FRAME · GT", warranty: "2 YRS" },
  n1: { line: "STEEL FRAME · GT", warranty: "2 YRS" },
  rs1: { line: "CARBON STEEL · LASER CUT", warranty: "2 YRS" },
  "rs-formula-m4a-full-motion": { line: "D-BOX 4250i · 4 ACTUATORS", warranty: "2 YRS" },
  "rs1-light": { line: "TURNKEY SIMULATOR", warranty: "2 YRS" },
  "rs-formula-turnkey": { line: "TURNKEY SIMULATOR", warranty: "2 YRS" },
};

import catalog from "../data/catalog.json";

export type Product = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  brand: string;
  cat: string;
  price: number;
  old: number | null;
  img: string[];
  cap: number | null; // bottles of 0.75 l
  zones: number | null;
  ranges: string[]; // temperature range per zone, top to bottom: "5–12"
  install: string;
  dims: { w: number; h: number; d: number } | null; // cm
  noise: number | null; // dB
  vol: number | null; // climate units: cellar volume up to, m³
  watts: number | null; // climate units: cooling capacity, W
  climate: string; // climate units: temperature range text
  specs: { g: string; rows: [string, string][] }[];
  desc: string[];
};
export type Category = { id: string; title: string; note: string };

export const products = catalog.products as Product[];
export const categories = (catalog.categories as Category[]).filter((c) => products.some((p) => p.cat === c.id));
export const bySlug = (s: string) => products.find((p) => p.slug === s)!;
export const catTitle = (id: string) => categories.find((c) => c.id === id)?.title ?? "";

export const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
export const url = (path = "") => `${BASE}/${path.replace(/^\//, "")}`;
export const pimg = (id: string, w: 480 | 960 = 480) => `${BASE}/p/${id}-${w}.webp`;
export const img = (name: string, w: number) => `${BASE}/img/${name}-${w}.webp`;
export const srcset = (name: string, ws: number[]) => ws.map((w) => `${img(name, w)} ${w}w`).join(", ");
export const rub = (n: number) => n.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽";
export const plural = (n: number, one: string, few: string, many: string) => {
  const a = n % 10, b = n % 100;
  return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
};

// From the client's contacts page (bscs.ru/contacts)
export const contacts = {
  phone: "+7 (495) 518-25-50",
  phoneHref: "tel:+74955182550",
  phone2: "+7 (499) 112-31-49",
  phone2Href: "tel:+74991123149",
  hours: "Пн–Пт 10:00–18:30",
  city: "Москва",
  address: "Измайловский проезд, 14, к. 2",
  company: "ООО «Бест Климат Системс»",
  inn: "7719482998",
  clients: ["Торро Гриль", "Кофемания", "Luce", "Сахалин"],
};

/** Compact client-side index for the cart: id → display data, bottles and zones. */
export const cartIndex = Object.fromEntries(
  products.map((p) => [p.id, { n: p.name, v: p.kind, p: p.price, i: p.img[0] ?? "", s: p.slug, b: p.cap ?? 0, z: p.zones ?? 0 }]),
);

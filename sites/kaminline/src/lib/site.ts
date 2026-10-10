import catalog from "../data/catalog.json";

export type Variant = { id: string; label: string; price: number; old: number | null; img: string[]; sw: string[]; scene: boolean[] };
export type Product = {
  slug: string; name: string; sub: string; cat: string; from: number;
  specs: { g: string; rows: [string, string][] }[]; desc: string[];
  kw: number | null; country: string; warranty: string; width: string; fuel: string; src: string;
  variants: Variant[];
};
export type Category = { id: string; title: string };

export const products = catalog.products as Product[];
export const categories = catalog.categories as Category[];
/** Catalogue number, as in an auction or atelier catalogue: № 007 */
export const lot = (p: Product) => "№\u00a0" + String(products.indexOf(p) + 1).padStart(3, "0");
export const bySlug = (s: string) => products.find((p) => p.slug === s)!;
export const catTitle = (id: string) => categories.find((c) => c.id === id)?.title ?? "";
export const CAT_NOTE: Record<string, string> = {
  kamini: "Готовые камины и проекты под ключ",
  "izrazcovye-kaminy": "Авторская керамика ручной работы",
  topki: "Сердце камина: чугун и сталь",
  "kamin-pechi": "Отдельностоящие печи-камины",
  biokamini: "Живой огонь без дымохода",
  electro: "3D-пламя для квартиры",
};

export const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
export const url = (path = "") => `${BASE}/${path.replace(/^\//, "")}`;
export const pimg = (id: string, w: 480 | 960 = 480) => `${BASE}/p/${id}-${w}.webp`;
export const img = (name: string, w: number) => `${BASE}/img/${name}-${w}.webp`;
export const rub = (n: number) => n.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽";
/** Rule of thumb used by stove makers: about 1 kW of heat per 10 m² of room. */
export const area = (kw: number) => Math.round(kw * 10);

export const contacts = {
  phone: "+7 (495) 116-51-62",
  phoneHref: "tel:+74951165162",
  free: "8 (800) 550-28-33",
  freeHref: "tel:88005502833",
  max: "+7 (925) 242-42-42",
  email: "kaminline@mail.ru",
  telegram: "https://t.me/kaminline",
  salon: "Центр дизайна «Экспострой на Нахимовском»",
  address: "Москва, Нахимовский проспект, 24",
  place: "павильон 2, 1 этаж, сектор В, ряд 1, места 16 и 36",
  metro: "м. Профсоюзная",
  hours: "Пн–Сб 10:00–20:00 · Вс 10:00–19:00",
};

export const BRANDS = ["Spartherm", "Romotop", "Kratki", "Nordpeis", "Contura", "Edilkamin", "La Nordica", "Schmid", "Brunner", "Austroflamm", "Focus", "MCZ", "Piazzetta", "Palazzetti", "Hark", "Invicta", "Godin", "Seguin", "Varde", "Keddy", "Aito", "Kalfire", "Element4", "Dimplex", "Totem", "Supra", "Schiedel", "Bordelet", "Hergom", "Plamen"];

export const cartIndex = Object.fromEntries(
  products.flatMap((p) => p.variants.map((v) => [v.id, { n: p.name, v: v.label, p: v.price, i: v.img[0] ?? "", s: p.slug }])),
);

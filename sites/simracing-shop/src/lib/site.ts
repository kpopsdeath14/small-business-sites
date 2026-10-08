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

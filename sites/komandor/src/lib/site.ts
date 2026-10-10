import catalog from "../data/catalog.json";

export type Item = {
  id: string;
  slug: string;
  cat: "boats" | "motors" | "trailers";
  name: string;
  brand: string;
  price: number;
  stock: boolean;
  img: string[];
  specs: [string, string][];
  desc: string[];
  tags: string[]; // boats: what they are for
  len: number | null; // m
  beam: number | null; // m
  weight: number | null; // kg
  people: number | null;
  hp: [number, number] | null; // boats: allowed motor power; motors: rated power
  hull: string;
  load: number | null; // trailers: carrying capacity, kg
};

export const items = catalog.items as Item[];
export const boats = items.filter((i) => i.cat === "boats");
export const motors = items.filter((i) => i.cat === "motors");
export const trailers = items.filter((i) => i.cat === "trailers");
export const bySlug = (s: string) => items.find((i) => i.slug === s)!;
export const TAGS = ["Рыбалка", "Прогулки", "Каютные", "Алюминий", "Компактные"] as const;

export const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
export const url = (path = "") => `${BASE}/${path.replace(/^\//, "")}`;
export const pimg = (id: string, w: 640 | 1280 = 640) => `${BASE}/p/${id}-${w}.webp`;
export const img = (name: string, w: number) => `${BASE}/img/${name}-${w}.webp`;
export const rub = (n: number) => n.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽";
export const fmt = (n: number) => String(n).replace(".", ",");
export const plural = (n: number, one: string, few: string, many: string) => {
  const a = n % 10, b = n % 100;
  return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
};
export const href = (i: Item) => url(`${i.cat === "boats" ? "boat" : i.cat === "motors" ? "motor" : "trailer"}/${i.slug}/`);

// From the client's site (komandor-boats.ru): sales, service, messengers, salon
export const contacts = {
  sales: "+7 (910) 083-38-53",
  salesHref: "tel:+79100833853",
  service: "+7 (968) 068-26-26",
  serviceHref: "tel:+79680682626",
  wa: "https://wa.me/79772984772",
  tg: "https://t.me/+79772984745",
  vk: "https://vk.com/komandorboats",
  email: "comandor-marine@mail.ru",
  salon: "МО, г. Жуковский, Речной проезд, 21, стр. 6",
  hours: "без выходных, 10:00–20:00",
  // Жуковский, city coordinates
  lat: "55°36′ с. ш.",
  lon: "38°07′ в. д.",
};

/** Compact client-side index for the cart: id → display data. */
export const cartIndex = Object.fromEntries(items.map((i) => [i.id, { n: i.name.replace(/^(Катер|Лодка|Лодочный мотор|Мотор)\s+/i, ""), p: i.price, i: i.img[0] ?? "", h: href(i), c: i.cat, l: i.len, hp: i.hp, w: i.weight, ld: i.load }]));

// POLARSPA — demo content from polarspa.ru (archived 01.10.2026): models, prices, sizes and seats are theirs.
// Volumes marked `est` are our estimate from the size; all others are from their cards.

export const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
export const url = (path = "") => `${BASE}/${path.replace(/^\//, "")}`;
export const img = (name: string, w: 600 | 1200 = 1200) => `${BASE}/img/${name}-${w}.webp`;
export const pimg = (name: string, w: 480 | 960 = 960) => `${BASE}/p/${name}-${w}.webp`;
export const rub = (n: number) => Math.round(n).toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽";
export const plural = (n: number, one: string, few: string, many: string) => { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many; };

export const contacts = {
  phone: "8 800 101-26-23",
  phoneHref: "tel:88001012623",
  email: "info@polarspa.ru",
  tg: "https://t.me/polarspa_ru",
  wa: "https://wa.me/79961882649",
  waNum: "79961882649",
  vk: "https://vk.com/polarspa",
  hours: "Пн–Вс 10:00–21:00",
  company: "ООО «Полар Спа»",
  inn: "6732228928",
  showrooms: [
    { city: "Москва", place: "ТРЦ «XL Home»", addr: "Мытищи, ул. Коммунистическая, 10, корп. 1" },
    { city: "Москва", place: "ТК «Конструктор»", addr: "25-й км МКАД, внешняя сторона" },
    { city: "Екатеринбург", place: "Интерьерный центр «Апартамент»", addr: "ул. Московская, 47" },
  ],
};

export type Shape = "round" | "square" | "corner" | "rect";
export type Tub = {
  id: string; line: string; name: string; price: number; old?: number;
  shape: Shape; w: number; l: number; h: number; // cm
  seats: [number, number]; litres: number; est?: boolean;
  heat: "stove" | "cold" | "spa" | "bath";
  img?: string; note: string;
};

// volumes from their catalogue cards
const L: Record<string, number> = { "elite-180": 800, "elite-200": 1000, "elite-220": 1300, "comfort-160-hot": 1000, "comfort-195-hot": 1300, "comfort-220-hot": 1700, "comfort-160-cold": 1000, "comfort-195-cold": 1300 };
const r = (id: string, line: string, name: string, price: number, d: number, seats: [number, number], heat: Tub["heat"], note: string, img?: string): Tub => ({
  id, line, name, price, shape: "round", w: d, l: d, h: 110, seats, heat, note, img, litres: L[id],
});

export const tubs: Tub[] = [
  r("elite-180", "ELITE", "ELITE 180", 310000, 180, [2, 4], "stove", "Печь встроена в чашу, обшивка — термососна", "elite"),
  r("elite-200", "ELITE", "ELITE 200", 365000, 200, [4, 6], "stove", "Самая популярная: на всю семью", "elite"),
  r("elite-220", "ELITE", "ELITE 220", 405000, 220, [6, 8], "stove", "Для большой компании", "elite"),
  { id: "quattro-180", line: "ELITE QUATTRO", name: "ELITE QUATTRO 180", price: 355000, shape: "square", w: 180, l: 180, h: 110, seats: [4, 4], heat: "stove", litres: 1000, note: "Квадратная чаша, угловые места", img: "quattro" },
  { id: "quattro-200", line: "ELITE QUATTRO", name: "ELITE QUATTRO 200", price: 420000, shape: "square", w: 200, l: 200, h: 110, seats: [6, 8], heat: "stove", litres: 1500, note: "Квадратная, самая вместительная", img: "quattro" },
  r("comfort-160-hot", "COMFORT", "COMFORT 160 HOT", 285000, 160, [2, 4], "stove", "С печью: соотношение цены и качества", "comfort"),
  r("comfort-195-hot", "COMFORT", "COMFORT 195 HOT", 305000, 195, [4, 6], "stove", "С печью, для семьи", "comfort"),
  r("comfort-220-hot", "COMFORT", "COMFORT FAMILY HOT 220", 380000, 220, [6, 8], "stove", "Семейная, с печью", "comfort"),
  r("comfort-160-cold", "COMFORT", "COMFORT 160 COLD", 220000, 160, [2, 4], "cold", "Без печи: холодная купель после парной", "comfort"),
  r("comfort-195-cold", "COMFORT", "COMFORT COLD 195", 240000, 195, [4, 6], "cold", "Без печи, на компанию", "comfort"),
  { id: "corner-130", line: "CORNER", name: "CORNER SMALL", price: 145000, shape: "corner", w: 130, l: 130, h: 110, seats: [2, 2], heat: "bath", litres: 600, est: true, note: "Угловая: экономит место в бане", img: "corner" },
  { id: "corner-160", line: "CORNER", name: "CORNER BIG", price: 180000, shape: "corner", w: 160, l: 160, h: 110, seats: [2, 4], heat: "bath", litres: 900, est: true, note: "Угловая, на улице или в доме", img: "corner" },
  { id: "standart-68", line: "STANDART", name: "STANDART 68", price: 110000, shape: "rect", w: 68, l: 130, h: 110, seats: [1, 1], heat: "bath", litres: 700, est: true, note: "Купель для бани на одного", img: "standart" },
  { id: "standart-79", line: "STANDART", name: "STANDART 79", price: 112000, shape: "rect", w: 79, l: 125, h: 110, seats: [1, 1], heat: "bath", litres: 780, est: true, note: "Компактная, для парной", img: "standart" },
  { id: "standart-79d", line: "STANDART", name: "STANDART 79 double", price: 130000, shape: "rect", w: 79, l: 145, h: 110, seats: [2, 2], heat: "bath", litres: 900, est: true, note: "На двоих", img: "standart" },
  { id: "standart-98", line: "STANDART", name: "STANDART 98", price: 140000, shape: "rect", w: 98, l: 175, h: 110, seats: [2, 2], heat: "bath", litres: 1300, est: true, note: "Большая прямоугольная", img: "standart" },
  { id: "spa-155", line: "СПА-БАССЕЙН", name: "PS 155-31", price: 550000, old: 700000, shape: "square", w: 155, l: 155, h: 80, seats: [2, 2], heat: "spa", litres: 880, note: "Гидромассаж, подогрев, подсветка", img: "spa" },
  { id: "spa-200", line: "СПА-БАССЕЙН", name: "PS 200-31", price: 650000, old: 800000, shape: "square", w: 200, l: 200, h: 88, seats: [4, 6], heat: "spa", litres: 1100, note: "Гидромассажный спа-бассейн на семью", img: "spa" },
  { id: "spa-225", line: "СПА-БАССЕЙН", name: "PS 225-67", price: 750000, old: 900000, shape: "square", w: 225, l: 225, h: 88, seats: [4, 6], heat: "spa", litres: 1360, note: "67 форсунок гидромассажа", img: "spa" },
];
export const byId = (id: string) => tubs.find((t) => t.id === id)!;

export type Bath = { id: string; name: string; len: number; price: number };
// modular saunas: outer length and price from their catalogue
export const baths: Bath[] = [
  { id: "l1", name: "L1", len: 1.5, price: 525000 },
  { id: "l2", name: "L2", len: 2.25, price: 630000 },
  { id: "m2", name: "M2", len: 2.55, price: 800000 },
  { id: "m4", name: "M4", len: 4.2, price: 1390000 },
  { id: "m6", name: "M6", len: 6, price: 2090000 },
  { id: "m8", name: "M8", len: 8, price: 2665000 },
];

// The configurator follows their ELITE 200 page: cladding, bowl colour and options with their prices.
export type Finish = { id: string; name: string; wood: "pine" | "birch"; tone: "light" | "dark" | "graphite"; add: number; sw: string };
export const finishes: Finish[] = [
  { id: "pine-light", name: "Термососна светлая", wood: "pine", tone: "light", add: 0, sw: "#c8925a" },
  { id: "pine-dark", name: "Термососна тёмная", wood: "pine", tone: "dark", add: 0, sw: "#6b4128" },
  { id: "pine-graphite", name: "Термососна графит", wood: "pine", tone: "graphite", add: 0, sw: "#3c3d3f" },
  { id: "birch-light", name: "Термоберёза светлая", wood: "birch", tone: "light", add: 30000, sw: "#d2a974" },
  { id: "birch-dark", name: "Термоберёза тёмная", wood: "birch", tone: "dark", add: 30000, sw: "#5e3a24" },
  { id: "birch-graphite", name: "Термоберёза графит", wood: "birch", tone: "graphite", add: 30000, sw: "#353638" },
];
export type Bowl = { id: string; c: string; add: number };
export const bowls: Bowl[] = [
  { id: "S1", c: "#e1e1e1", add: 0 },
  { id: "S2", c: "#c7d5c7", add: 16000 },
  { id: "S3", c: "#e8dec4", add: 16000 },
  { id: "S4", c: "#9cc4cb", add: 16000 },
  { id: "S5", c: "#0184b8", add: 16000 },
  { id: "S6", c: "#6a6e72", add: 16000 },
];
export type Opt = { id: string; name: string; price: number; note: string; birch?: number };
export const options: Opt[] = [
  { id: "aero", name: "Аэромассаж", price: 56000, note: "Пузырьки воздуха со дна чаши" },
  { id: "led", name: "LED-подсветка", price: 26000, note: "Хромотерапия: цвет воды меняется" },
  { id: "warm", name: "Утепление чаши", price: 26000, note: "Вода дольше держит тепло" },
  { id: "cover", name: "Термокрышка", price: 41000, note: "Нагрев быстрее, тепло до утра" },
  { id: "tent", name: "Тент", price: 16000, note: "От листьев и снега" },
  { id: "shelf", name: "Полка", price: 8000, birch: 11000, note: "Для бокалов — прямо у воды" },
];
export const included = ["Печь из нержавеющей стали, 35 кВт", "Лестница, 3 ступени", "Защита дымохода", "Декоративная лента из нержавейки"];

// ЦИПС — demo content. Prices come from the client's price list (New-price-list.xlsx, 01.12.2022)
// and "Цены на изделия" on cips-spb.ru; objects and photos from "Примеры работ" and the galleries.

export const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
export const url = (path = "") => `${BASE}/${path.replace(/^\//, "")}`;
export const img = (name: string, w: 600 | 1200 = 1200) => `${BASE}/img/${name}-${w}.webp`;
export const srcset = (name: string) => `${img(name, 600)} 600w, ${img(name, 1200)} 1200w`;
export const rub = (n: number) => Math.round(n).toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽";

export const contacts = {
  phone: "+7 (812) 564-99-04",
  phoneHref: "tel:+78125649904",
  viktor: "+7 (901) 971-00-37",
  viktorHref: "tel:+79019710037",
  dmitry: "+7 (921) 855-23-75",
  dmitryHref: "tel:+79218552375",
  email: "cips.2011@yandex.ru",
  address: "Санкт-Петербург, ул. Химиков, 28, литер АС",
  hours: "Пн–Пт 9:00–18:00",
  company: "ООО «Центр изделий повышенной сложности»",
  since: 2011,
};

/** Price per m² by wood, from the price list. */
export type Wood = "pine" | "oak" | "dark" | "white";
export const WOODS: { id: Wood; name: string; note: string; base: "pine" | "oak"; sw: string }[] = [
  { id: "oak", name: "Дуб", note: "Золотистый, с ярким рисунком", base: "oak", sw: "wood-oak" },
  { id: "pine", name: "Сосна", note: "Тёплая, с сучками", base: "pine", sw: "wood-pine" },
  { id: "dark", name: "Тёмный дуб", note: "Морёный тон под лак", base: "oak", sw: "wood-dark" },
  { id: "white", name: "Эмаль", note: "По каталогу RAL / NCS, с патиной", base: "pine", sw: "wood-white" },
];
export type Kind = "inner" | "entry" | "giop" | "window" | "giopwin";
export const KINDS: { id: Kind; name: string; short: string; price: Record<"pine" | "oak", number>; kit: number; w: number; h: number; leaves: number }[] = [
  { id: "inner", name: "Межкомнатная дверь", short: "Межкомнатная", price: { pine: 30000, oak: 46000 }, kit: 4500, w: 800, h: 2000, leaves: 1 },
  { id: "entry", name: "Входная дверь, полотно 80 мм", short: "Входная", price: { pine: 48000, oak: 80000 }, kit: 9500, w: 1000, h: 2100, leaves: 1 },
  { id: "giop", name: "Историческая дверь ГИОП", short: "Дверь ГИОП", price: { pine: 47500, oak: 70000 }, kit: 0, w: 1600, h: 2900, leaves: 2 },
  { id: "window", name: "Евроокно, двухкамерный стеклопакет", short: "Евроокно", price: { pine: 25000, oak: 42000 }, kit: 0, w: 1400, h: 1700, leaves: 2 },
  { id: "giopwin", name: "Историческое окно ГИОП", short: "Окно ГИОП", price: { pine: 21000, oak: 40000 }, kit: 0, w: 1300, h: 2200, leaves: 2 },
];
/** Rules from the price list notes. */
export const RULES = { bigH: 2200, bigW: 950, bigK: 0.1, bulkM2: 30 };

export const CATALOG = [
  { id: "giop", t: "Окна и двери ГИОП", from: 28500, img: "giop-pair", note: "Воссоздание по историческим образцам для памятников архитектуры" },
  { id: "entry", t: "Входные двери", from: 77000, img: "door-dark", note: "Массив дуба и сосны, полотно 80 мм, утеплённые" },
  { id: "inner", t: "Межкомнатные двери", from: 40500, img: "door-white2", note: "Распашные, раздвижные, арочные, нестандартные" },
  { id: "window", t: "Деревянные окна", from: 32500, img: "win-open", note: "Дуб, сосна, лиственница, дерево-алюминий" },
  { id: "stair", t: "Лестницы и ограждения", from: 300000, img: "stair", note: "Маршевые, винтовые, на больцах и косоурах" },
  { id: "furniture", t: "Мебель из массива", from: 100000, img: "furniture", note: "Кухни, библиотеки, винные шкафы, историческая мебель" },
  { id: "billiard", t: "Бильярдные столы", from: 1200000, img: "billiard", note: "Резьба ручной работы, массив ценных пород" },
];

/** Objects from "Примеры работ", with real coordinates for the address book. */
export const OBJECTS = [
  { img: "obj-hermitage", t: "Эрмитаж", a: "Дворцовая пл., 2", y: "Санкт-Петербург" },
  { img: "obj-sheremetev", t: "Шереметьевский дворец", a: "наб. Фонтанки, 34", y: "Санкт-Петербург" },
  { img: "obj-gatchina", t: "Гатчинский дворец", a: "Красноармейский пр., 1", y: "Гатчина" },
  { img: "obj-petra-pavla", t: "Собор Петра и Павла", a: "Санкт-Петербургский пр., 32", y: "Петергоф" },
  { img: "obj-dostoevsky", t: "Музей Достоевского", a: "Кузнечный пер., 5/2", y: "Санкт-Петербург" },
  { img: "obj-popov", t: "Музей А. С. Попова", a: "ул. Профессора Попова, 5", y: "Санкт-Петербург" },
  { img: "obj-rerih", t: "Музей Рерихов", a: "", y: "Санкт-Петербург" },
  { img: "obj-nevsky4", t: "Невский проспект, 4", a: "Военная прокуратура", y: "Санкт-Петербург" },
  { img: "obj-itmo", t: "Университет ИТМО", a: "", y: "Санкт-Петербург" },
  { img: "obj-konevets", t: "Коневский монастырь", a: "о. Коневец", y: "Ладожское озеро" },
  { img: "obj-hittolovo", t: "Храм в Хиттолово", a: "п. Хиттолово", y: "Ленинградская обл." },
];

// ITS — demo content from its-sauna.ru (11.10.2026): models, prices, sizes, stoves and materials are theirs.

export const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
export const url = (path = "") => `${BASE}/${path.replace(/^\//, "")}`;
export const img = (name: string, w: 600 | 1200 = 1200) => `${BASE}/img/${name}-${w}.webp`;
export const mimg = (name: string, w: 480 | 960 = 960) => `${BASE}/m/${name}-${w}.webp`;
export const plan = (name: string) => `${BASE}/plan/${name}-640.webp`;
export const rub = (n: number) => Math.round(n).toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽";
export const plural = (n: number, one: string, few: string, many: string) => { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many; };

export const contacts = {
  phone: "+7 925 530-92-52",
  phoneHref: "tel:+79255309252",
  wa: "https://wa.me/79255309252",
  waNum: "79255309252",
  line: "+7 495 926-92-00",
  lineHref: "tel:+74959269200",
  build: "+7 495 926-92-95",
  buildHref: "tel:+74959269295",
  email: "info@its-sauna.ru",
  company: "ООО «Интеллект, Техника, Строительство»",
  inn: "7729229610",
  since: 1992,
  stores: [
    { name: "Магазин и офис", addr: "Москва, Очаковское шоссе, 30, стр. 4", note: "м. Озёрная, Мичуринский проспект", hours: "Пн–Пт 10:00–19:00" },
    { name: "Магазин «Сауна»", addr: "Новопетровское, ул. Первомайская, 52", note: "82-й км Новорижского шоссе", hours: "по телефону" },
  ],
};

export type Wood = "lipa" | "abash" | "cedar";
export type Model = {
  id: string; name: string; price: number | null;
  w: number; d: number; h: number; // mm, as they list them
  cap: [number, number]; kw: number; steam?: boolean;
  wood: Wood; windows: number; salt?: boolean; stars?: boolean; glassFront?: boolean;
  photo?: boolean; photo2?: boolean; plan?: boolean;
  note: string;
};

const m = (o: Model) => o;
export const models: Model[] = [
  m({ id: "mini", name: "Мини", price: 170000, w: 1100, d: 1100, h: 2100, cap: [1, 1], kw: 2.9, wood: "lipa", windows: 0, note: "Самая компактная: на балконе, в ванной, вместо кладовой. Работает от обычной розетки 220 В." }),
  m({ id: "malyushka", name: "Малюшка", price: 190000, w: 1250, d: 1250, h: 2100, cap: [1, 2], kw: 3.6, wood: "abash", windows: 0, photo: true, plan: true, note: "Помещается на балконе или лоджии. Светильник под полоком — мягкий свет снизу." }),
  m({ id: "krasa", name: "Краса", price: 210000, w: 1600, d: 1600, h: 2100, cap: [2, 2], kw: 4.5, wood: "abash", windows: 0, photo: true, plan: true, note: "Сауна для дома и квартиры на двоих." }),
  m({ id: "lyubava", name: "Любава", price: 250000, w: 1600, d: 1950, h: 2100, cap: [2, 3], kw: 4.5, wood: "lipa", windows: 0, plan: true, note: "При небольших размерах можно париться лёжа. Вход угловой или прямой." }),
  m({ id: "charovnitsa", name: "Чаровница", price: 270000, w: 2000, d: 2000, h: 2100, cap: [2, 3], kw: 6, wood: "lipa", windows: 0, photo: true, plan: true, note: "Лучшее соотношение цены и простора: верхнее и нижнее лежачие места." }),
  m({ id: "misteriya", name: "Мистерия", price: 310000, w: 2150, d: 2150, h: 2200, cap: [3, 4], kw: 9, wood: "lipa", windows: 0, photo: true, plan: true, note: "Классическая финская сауна, весьма просторная. Неяркий расслабляющий свет." }),
  m({ id: "vorozheya", name: "Ворожея", price: 350000, w: 2300, d: 2300, h: 2200, cap: [4, 4], kw: 9, wood: "lipa", windows: 2, plan: true, note: "Пятигранный, почти круглый фасад и угловые полки." }),
  m({ id: "gryeza", name: "Грёза", price: 400000, w: 2000, d: 2000, h: 2300, cap: [2, 3], kw: 9, wood: "abash", windows: 6, photo: true, plan: true, note: "Шесть фигурных окон — эксклюзивный рисунок стекла." }),
  m({ id: "kupava", name: "Купава", price: 420000, w: 2150, d: 2150, h: 2200, cap: [3, 4], kw: 9, wood: "lipa", windows: 2, plan: true, note: "Три уровня полков: прогревает ровно и лёжа, и сидя." }),
  m({ id: "svetlitsa", name: "Светлица", price: 420000, w: 2850, d: 2100, h: 2200, cap: [6, 6], kw: 10.5, wood: "lipa", windows: 0, photo: true, plan: true, note: "Очень просторная: четыре лежачих места, парильщики видят друг друга." }),
  m({ id: "lyubava_lyuks", name: "Любава Люкс", price: 450000, w: 1600, d: 1950, h: 2400, cap: [2, 3], kw: 6.6, wood: "abash", windows: 2, salt: true, stars: true, photo: true, photo2: true, note: "Козырёк с подсветкой, звёздное небо и вставка из гималайской соли." }),
  m({ id: "milyena", name: "Милёна", price: 490000, w: 2200, d: 2200, h: 2300, cap: [3, 4], kw: 9, wood: "abash", windows: 6, photo: true, plan: true, note: "Лаконичный дизайн: липа и ольха, цельностеклянная дверь и шесть окон." }),
  m({ id: "karina", name: "Карина", price: 550000, w: 2300, d: 1850, h: 2200, cap: [3, 4], kw: 9, wood: "lipa", windows: 0, salt: true, glassFront: true, photo: true, plan: true, note: "Новинка: Г-образный стеклянный фасад и световое панно из гималайской соли." }),
  m({ id: "otrada", name: "Отрада", price: 700000, w: 2400, d: 2400, h: 2300, cap: [4, 5], kw: 9, steam: true, wood: "abash", windows: 1, photo: true, note: "Большое светлое окно и дополнительный режим русской бани." }),
  m({ id: "velichava", name: "Величава", price: 700000, w: 2500, d: 2500, h: 2500, cap: [4, 5], kw: 9, steam: true, wood: "abash", windows: 2, photo: true, plan: true, note: "Козырёк с пятью светильниками и режим русской бани." }),
  m({ id: "kameya", name: "Камея", price: 800000, w: 2300, d: 2300, h: 2300, cap: [4, 5], kw: 9, steam: true, wood: "cedar", windows: 6, photo: true, plan: true, note: "Абаши и канадский кедр, шесть фигурных окон, печь с паром." }),
  m({ id: "iskusnitsa", name: "Искусница", price: 800000, w: 2400, d: 2400, h: 2400, cap: [4, 5], kw: 9, wood: "cedar", windows: 2, stars: true, photo: true, note: "Для ценителей стиля: звёздное небо и шайка-светильник." }),
  m({ id: "uslada", name: "Услада", price: 800000, w: 2450, d: 2450, h: 2300, cap: [5, 7], kw: 9, steam: true, wood: "abash", windows: 2, photo: true, plan: true, note: "Два режима в одной сауне; полки эксклюзивного рисунка." }),
  m({ id: "kudesnitsa", name: "Кудесница", price: 850000, w: 2300, d: 2300, h: 2500, cap: [4, 5], kw: 9, steam: true, wood: "abash", windows: 4, photo: true, plan: true, note: "Световые трубки за подспинниками и козырёк с галогеновым светом." }),
  m({ id: "sudarushka", name: "Сударушка", price: 900000, w: 2500, d: 2500, h: 2400, cap: [4, 5], kw: 9, steam: true, wood: "cedar", windows: 4, stars: true, photo: true, plan: true, note: "Большая и просторная: звёздное небо и светильник со сменой цвета." }),
  m({ id: "svetlitsa_lyuks", name: "Светлица Люкс", price: 945000, w: 3000, d: 2250, h: 2400, cap: [6, 6], kw: 11, wood: "cedar", windows: 0, salt: true, glassFront: true, photo: true, plan: true, note: "Весь фасад — стекло; центральное панно из 36 кирпичей гималайской соли." }),
  m({ id: "gratsiya", name: "Грация", price: 950000, w: 2550, d: 2550, h: 2500, cap: [4, 5], kw: 9, steam: true, wood: "cedar", windows: 6, stars: true, photo: true, plan: true, note: "Козырёк, шесть окон, звёздное небо и светильник со сменой цвета." }),
  m({ id: "utekha", name: "Утеха", price: 950000, w: 2500, d: 2500, h: 2500, cap: [4, 5], kw: 9, steam: true, wood: "cedar", windows: 2, salt: true, stars: true, photo: true, note: "Финская сауна и влажная паровая баня в одной; звёздное небо на 21 точку." }),
  m({ id: "divna", name: "Дивна", price: null, w: 2600, d: 2600, h: 2400, cap: [5, 6], kw: 9, steam: true, wood: "abash", windows: 4, photo: true, plan: true, note: "Необычная форма стен: вагонка особого профиля показывает рисунок липы." }),
];
export const byId = (id: string) => models.find((x) => x.id === id)!;
export const woodName: Record<Wood, string> = { lipa: "липа", abash: "абаши", cedar: "абаши и кедр" };

// Three kinds of steam they build, with their own build terms.
export const baths = [
  { id: "fin", name: "Финская сауна", t: [80, 100], rh: [5, 20], days: "от 5 дней", note: "Сухой жар 80–100 °C. Электропечь Helo или Harvia, полки из липы или абаши.", img: "fin1" },
  { id: "rus", name: "Русская баня", t: [60, 75], rh: [40, 65], days: "от 35 рабочих дней", note: "Мягкий влажный пар и изразцовая дровяная печь — умеют строить даже «по-чёрному».", img: "rus1" },
  { id: "tur", name: "Хамам", t: [40, 50], rh: [90, 100], days: "от 20 рабочих дней", note: "Тёплый мрамор, курна и пар от парогенератора; по типовым проектам ЦНИИПРОМЗДАНИЙ.", img: "tur1" },
] as const;

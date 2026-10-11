// «Ясень» — demo content from yasen-perm.ru (11.10.2026). Prices are their published price list
// for glued pine staircase parts: [sanded, painted] in roubles.

export const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
export const url = (path = "") => `${BASE}/${path.replace(/^\//, "")}`;
export const img = (name: string, w: 600 | 1200 = 1200) => `${BASE}/img/${name}-${w}.webp`;
export const pimg = (name: string, w: 480 | 960 = 960) => `${BASE}/p/${name}-${w}.webp`;
export const rub = (n: number) => Math.round(n).toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽";

export const contacts = {
  office: "+7 34271 3-33-39",
  officeHref: "tel:+73427133339",
  manager: "+7 902 790-55-01",
  managerHref: "tel:+79027905501",
  managerName: "Дмитрий Шамурин, менеджер",
  director: "+7 902 474-02-93",
  directorHref: "tel:+79024740293",
  directorName: "Игорь Пятышев, директор",
  email: "yasen2007@mail.ru",
  vk: "https://vk.com/id462090579",
  addr: "Пермский край, Кунгур, ул. Промышленная, 21, стр. 2",
  company: "ООО «Ясень»",
  inn: "5917595647",
  since: 2007,
};

type P = [number, number];
// steps 300 mm deep, by width (mm) and thickness
export const step: Record<40 | 50, Record<number, P>> = {
  40: { 600: [470, 660], 700: [530, 730], 800: [610, 870], 900: [690, 980], 1000: [770, 1080], 1100: [830, 1180], 1200: [910, 1290], 1300: [990, 1390], 1400: [1070, 1510] },
  50: { 600: [570, 770], 700: [650, 890], 800: [750, 1020], 900: [840, 1130], 1000: [940, 1260], 1100: [1020, 1380], 1200: [1110, 1500], 1300: [1210, 1630], 1400: [1300, 1740] },
};
export const price = {
  winder: { 40: [2900, 3860], 50: [3550, 4520] } as Record<40 | 50, P>, // per m²
  landing: { 40: [2520, 3480], 50: [3070, 4050] } as Record<40 | 50, P>, // per m²
  stringer: [1280, 1700] as P, // straight glued stringer 320×60, per m
  handrail: [340, 520] as P, // straight handrail 65×80, per m
  riser: [220, 360] as P, // riser 160×18, per m
  post: [670, 910] as P, // turned post 90×90, each
  ball: [160, 220] as P, // turned ball 100×100 on top of a post
  baluster: { b50: [220, 320], b55: [280, 410], b60: [300, 440] } as Record<string, P>,
};
export const balusters = [
  { id: "b50", name: "Точёная 50×50" },
  { id: "b55", name: "Точёно-фрезерованная 55×55" },
  { id: "b60", name: "Точёная 60×60" },
];

export const process = [
  { t: "Сушка", n: "8–10 %", d: "Две сушильные камеры — на 24 и 10 м³ — с автоматикой: доска сохнет без внутренних напряжений и не ведёт её потом в доме." },
  { t: "Склейка", n: "Kleiberit", d: "Каждая деталь — клеёная из ламелей: так меньше трещин и изгибов. Немецкий клей, пневматические прессы-ваймы." },
  { t: "Токарка", n: "по шаблону", d: "Балясины и столбы точатся на токарно-копировальном станке — все одной формы и профиля." },
  { t: "Шлифовка", n: "в несколько проходов", d: "Несколько проходов шкуркой, от крупной к мелкой: гладко на ощупь и ровно под лак." },
  { t: "Покраска", n: "Sayerlack", d: "Итальянские морилки и лаки, цвет — из палитры или под ваш интерьер. Красим в разобранном виде, в покрасочной камере." },
  { t: "Установка", n: "1–2 дня", d: "Монтажники со стажем больше 10 лет; если есть металл — едут и сварщики. На месте докрашиваем только подогнанные детали." },
];

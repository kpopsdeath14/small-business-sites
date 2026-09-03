/**
 * СДЭК delivery estimate.
 *
 * This is a *calculator*, not an integration: it reproduces the shape of СДЭК's tariff (zone
 * coefficient × weight × service level) so a visitor sees a realistic number and ETA before
 * ordering, without the site needing a paid API key, a backend, or the seller's contract rates.
 * Every surface that shows a number from here also says the figure is preliminary and the
 * manager confirms it — see CartDrawer's `DELIVERY_DISCLAIMER`.
 *
 * Swapping this for the real СДЭК API later means replacing `quoteDelivery` alone: the UI reads
 * nothing else from this module.
 */

export interface City {
  name: string;
  /** 1 = Москва/СПб, 2 = Центр и Поволжье, 3 = Юг, Урал, Север, 4 = Сибирь и Дальний Восток. */
  zone: 1 | 2 | 3 | 4;
}

export const CITIES: City[] = [
  { name: "Москва", zone: 1 },
  { name: "Санкт-Петербург", zone: 1 },
  { name: "Химки", zone: 1 },
  { name: "Балашиха", zone: 1 },
  { name: "Подольск", zone: 1 },
  { name: "Тверь", zone: 2 },
  { name: "Тула", zone: 2 },
  { name: "Ярославль", zone: 2 },
  { name: "Владимир", zone: 2 },
  { name: "Рязань", zone: 2 },
  { name: "Калуга", zone: 2 },
  { name: "Нижний Новгород", zone: 2 },
  { name: "Казань", zone: 2 },
  { name: "Чебоксары", zone: 2 },
  { name: "Ижевск", zone: 2 },
  { name: "Пенза", zone: 2 },
  { name: "Самара", zone: 2 },
  { name: "Тольятти", zone: 2 },
  { name: "Саратов", zone: 2 },
  { name: "Ульяновск", zone: 2 },
  { name: "Воронеж", zone: 2 },
  { name: "Липецк", zone: 2 },
  { name: "Белгород", zone: 3 },
  { name: "Ростов-на-Дону", zone: 3 },
  { name: "Краснодар", zone: 3 },
  { name: "Сочи", zone: 3 },
  { name: "Ставрополь", zone: 3 },
  { name: "Волгоград", zone: 3 },
  { name: "Астрахань", zone: 3 },
  { name: "Калининград", zone: 3 },
  { name: "Псков", zone: 3 },
  { name: "Мурманск", zone: 3 },
  { name: "Архангельск", zone: 3 },
  { name: "Киров", zone: 3 },
  { name: "Пермь", zone: 3 },
  { name: "Уфа", zone: 3 },
  { name: "Екатеринбург", zone: 3 },
  { name: "Челябинск", zone: 3 },
  { name: "Тюмень", zone: 3 },
  { name: "Оренбург", zone: 3 },
  { name: "Сургут", zone: 4 },
  { name: "Омск", zone: 4 },
  { name: "Новосибирск", zone: 4 },
  { name: "Барнаул", zone: 4 },
  { name: "Кемерово", zone: 4 },
  { name: "Красноярск", zone: 4 },
  { name: "Иркутск", zone: 4 },
  { name: "Улан-Удэ", zone: 4 },
  { name: "Чита", zone: 4 },
  { name: "Якутск", zone: 4 },
  { name: "Хабаровск", zone: 4 },
  { name: "Владивосток", zone: 4 },
  { name: "Южно-Сахалинск", zone: 4 },
];

export type DeliveryMethodId = "pvz" | "courier" | "post";

export interface DeliveryMethod {
  id: DeliveryMethodId;
  label: string;
  hint: string;
}

export const DELIVERY_METHODS: DeliveryMethod[] = [
  { id: "pvz", label: "СДЭК — пункт выдачи", hint: "Забрать самому, самый дешёвый вариант" },
  { id: "courier", label: "СДЭК — курьер до двери", hint: "Привезут по адресу, +190 ₽ к тарифу" },
  { id: "post", label: "Почта России", hint: "Дольше, но дешевле и есть в любом посёлке" },
];

/** Multiplier applied to the seller's zone-1 base tariff. Roughly matches СДЭК's own zone steps. */
const ZONE_COEFFICIENT: Record<City["zone"], number> = { 1: 1, 2: 1.3, 3: 1.65, 4: 2.2 };
/** Working-day ranges by zone: [ПВЗ, курьер, почта]. Courier adds a day for the last mile. */
const ZONE_DAYS: Record<City["zone"], [string, string, string]> = {
  1: ["1–2 дня", "1–2 дня", "3–5 дней"],
  2: ["2–3 дня", "2–4 дня", "5–8 дней"],
  3: ["3–5 дней", "4–6 дней", "7–11 дней"],
  4: ["5–8 дней", "6–9 дней", "10–16 дней"],
};
/** Per-kilogram surcharge above the first free kilogram, before the zone coefficient. */
const PER_EXTRA_KG = 45;
const COURIER_SURCHARGE = 190;
/** Почта России undercuts СДЭК's pickup tariff by roughly this much. */
const POST_DISCOUNT = 0.75;
const DEFAULT_BASE_PRICE = 290;

export interface QuoteInput {
  city: City | null;
  method: DeliveryMethodId;
  /** Total weight of the cart in kg. */
  weightKg: number;
  /** Goods subtotal, for the free-shipping threshold. */
  subtotal: number;
  basePrice?: number;
  freeFrom?: number;
}

export interface DeliveryQuote {
  /** Rounded to whole rubles; 0 when the free-shipping threshold applies. */
  price: number;
  days: string;
  /** True when the threshold zeroed the tariff — the UI says "бесплатно" instead of "0 ₽". */
  isFree: boolean;
  /** How much more the cart needs for free shipping, or 0 when it already qualifies / has no threshold. */
  freeIn: number;
}

export function quoteDelivery(input: QuoteInput): DeliveryQuote | null {
  const { city, method, weightKg, subtotal, basePrice = DEFAULT_BASE_PRICE, freeFrom } = input;
  if (!city) return null;

  const coefficient = ZONE_COEFFICIENT[city.zone];
  const extraKg = Math.max(0, Math.ceil(weightKg) - 1);
  const base = (basePrice + extraKg * PER_EXTRA_KG) * coefficient;

  const raw = method === "courier" ? base + COURIER_SURCHARGE : method === "post" ? base * POST_DISCOUNT : base;

  // "Бесплатная доставка от N ₽" is a pickup-point promise, the way sellers actually run it: the
  // СДЭК parcel tariff is waived, a courier's last mile still costs its surcharge, and Почта —
  // a different carrier the seller pays separately — is not covered at all.
  const qualifies = freeFrom !== undefined && subtotal >= freeFrom;
  const price = qualifies && method !== "post" ? (method === "courier" ? COURIER_SURCHARGE : 0) : raw;

  const dayIndex = method === "pvz" ? 0 : method === "courier" ? 1 : 2;

  return {
    price: Math.round(price / 10) * 10,
    days: ZONE_DAYS[city.zone][dayIndex],
    isFree: qualifies && method === "pvz",
    freeIn: freeFrom !== undefined && subtotal < freeFrom ? freeFrom - subtotal : 0,
  };
}

/** Case-insensitive prefix-then-substring match, capped for the suggestion dropdown. */
export function suggestCities(query: string, limit = 6): City[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const starts = CITIES.filter((c) => c.name.toLowerCase().startsWith(q));
  const contains = CITIES.filter((c) => !c.name.toLowerCase().startsWith(q) && c.name.toLowerCase().includes(q));
  return [...starts, ...contains].slice(0, limit);
}

export function findCity(name: string): City | null {
  const q = name.trim().toLowerCase();
  return CITIES.find((c) => c.name.toLowerCase() === q) ?? null;
}

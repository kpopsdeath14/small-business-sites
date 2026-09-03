import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { getCart, type CartLine, type CartStore } from "./cartStore.js";
import { formatPrice, pluralize } from "./format.js";
import {
  DELIVERY_METHODS,
  findCity,
  quoteDelivery,
  suggestCities,
  type City,
  type DeliveryMethodId,
} from "./delivery.js";

/**
 * The whole ordering experience in one island: cart → доставка (СДЭК estimate) → контакты →
 * подтверждение. It is the only hydrated component on the page; the catalog itself stays static
 * HTML, and its buttons talk to the same `window` cart store this island renders from.
 *
 * On submit the composed order opens in the seller's WhatsApp/Telegram/email — a real handoff to
 * a channel the seller already reads, rather than a form that posts nowhere. The delivery figure
 * travels with it as an estimate (see DELIVERY_DISCLAIMER), which is exactly what it is.
 */

interface PickupPoint {
  city: string;
  address: string;
  hours?: string;
  note?: string;
}

export interface DeliveryConfig {
  freeFrom?: number;
  basePrice?: number;
  processingDays?: string;
  note?: string;
  pickupPoints: PickupPoint[];
  orderChannel?: "whatsapp" | "telegram" | "email";
  orderContact?: string;
  paymentMethods: string[];
}

interface Props {
  /** localStorage namespace — one per store, since sibling demo sites share an origin. */
  scope: string;
  storeName: string;
  delivery?: DeliveryConfig;
}

const DELIVERY_DISCLAIMER =
  "Стоимость доставки рассчитана по тарифам СДЭК ориентировочно. Точную сумму и трек-номер менеджер подтвердит в ответном сообщении.";

type Step = "cart" | "delivery" | "contacts" | "done";
const STEPS: Step[] = ["cart", "delivery", "contacts"];
const STEP_TITLES: Record<Step, string> = {
  cart: "Корзина",
  delivery: "Доставка",
  contacts: "Оформление",
  done: "Заказ собран",
};

interface SubmittedOrder {
  number: string;
  text: string;
  link: string | null;
  channelLabel: string;
}

/** VT-250903-4821 — short, unambiguous over the phone, sortable by eye. */
function makeOrderNumber(): string {
  const now = new Date();
  const stamp = [now.getFullYear() % 100, now.getMonth() + 1, now.getDate()]
    .map((part) => String(part).padStart(2, "0"))
    .join("");
  return `VT-${stamp}-${String(Math.floor(1000 + Math.random() * 9000))}`;
}

function digitsOf(value: string): string {
  return value.replace(/\D/g, "");
}

/** Accepts either a bare phone or a wa.me/t.me/mailto link in `order_contact` and returns the
 *  deep link that carries the order text where the channel supports it. */
function buildOrderLink(
  channel: DeliveryConfig["orderChannel"],
  contact: string | undefined,
  storeName: string,
  text: string
): { link: string | null; channelLabel: string } {
  if (!contact) return { link: null, channelLabel: "менеджеру" };

  if (channel === "telegram") {
    const handle = contact.replace(/^.*t\.me\//, "").replace(/^@/, "");
    // Telegram cannot prefill a message to a user — the done screen copies the text instead.
    return { link: `https://t.me/${handle}`, channelLabel: "в Telegram" };
  }
  if (channel === "email") {
    const address = contact.replace(/^mailto:/, "");
    const subject = encodeURIComponent(`Заказ в ${storeName}`);
    return { link: `mailto:${address}?subject=${subject}&body=${encodeURIComponent(text)}`, channelLabel: "на почту" };
  }
  const phone = digitsOf(contact);
  if (!phone) return { link: null, channelLabel: "менеджеру" };
  return { link: `https://wa.me/${phone}?text=${encodeURIComponent(text)}`, channelLabel: "в WhatsApp" };
}

export default function CartDrawer({ scope, storeName, delivery }: Props) {
  const cartRef = useRef<CartStore | null>(null);
  if (!cartRef.current) cartRef.current = getCart(scope);
  const cart = cartRef.current;

  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("cart");

  const [cityQuery, setCityQuery] = useState("");
  const [city, setCity] = useState<City | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [method, setMethod] = useState<DeliveryMethodId>("pvz");
  const [pickupIndex, setPickupIndex] = useState(0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [payment, setPayment] = useState(delivery?.paymentMethods[0] ?? "Картой онлайн");
  const [agreed, setAgreed] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [order, setOrder] = useState<SubmittedOrder | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => cart.subscribe(setLines), [cart]);
  useEffect(() => cart.onOpenRequest(() => setOpen(true)), [cart]);

  // Body scroll lock + Esc to close, torn down together so an unmount can never leave the page stuck.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const subtotal = useMemo(() => lines.reduce((sum, line) => sum + line.price * line.qty, 0), [lines]);
  const count = useMemo(() => lines.reduce((sum, line) => sum + line.qty, 0), [lines]);
  const weight = useMemo(() => lines.reduce((sum, line) => sum + (line.weightKg ?? 0.5) * line.qty, 0), [lines]);

  const quote = useMemo(
    () =>
      quoteDelivery({
        city,
        method,
        weightKg: weight,
        subtotal,
        basePrice: delivery?.basePrice,
        freeFrom: delivery?.freeFrom,
      }),
    [city, method, weight, subtotal, delivery?.basePrice, delivery?.freeFrom]
  );

  const pickupPoints = useMemo(
    () => (city ? (delivery?.pickupPoints ?? []).filter((point) => point.city.toLowerCase() === city.name.toLowerCase()) : []),
    [city, delivery?.pickupPoints]
  );
  const selectedPickup = method === "pvz" ? pickupPoints[pickupIndex] : undefined;

  const suggestions = useMemo(() => (showSuggestions ? suggestCities(cityQuery) : []), [cityQuery, showSuggestions]);

  const total = subtotal + (quote?.price ?? 0);

  const pickCity = useCallback((next: City) => {
    setCity(next);
    setCityQuery(next.name);
    setShowSuggestions(false);
    setPickupIndex(0);
  }, []);

  const goToDelivery = () => {
    if (lines.length === 0) return;
    setStep("delivery");
  };

  const goToContacts = () => {
    if (!city) {
      setErrors({ city: "Выберите город доставки" });
      return;
    }
    setErrors({});
    setStep("contacts");
  };

  const composeOrderText = (orderNumber: string): string => {
    const rows = lines.map((line, i) => `${i + 1}. ${line.name} × ${line.qty} — ${formatPrice(line.price * line.qty)}`);
    const methodLabel = DELIVERY_METHODS.find((m) => m.id === method)?.label ?? "Доставка";
    const deliveryLine = quote
      ? `${methodLabel}, ${city?.name} — ${quote.isFree ? "бесплатно" : formatPrice(quote.price)} (${quote.days})`
      : `${methodLabel}, ${city?.name}`;

    return [
      `Заказ ${orderNumber} — ${storeName}`,
      "",
      "Товары:",
      ...rows,
      "",
      `Товары: ${formatPrice(subtotal)}`,
      `Доставка: ${deliveryLine}`,
      selectedPickup ? `Пункт выдачи: ${selectedPickup.address}` : null,
      `Итого: ${formatPrice(total)}`,
      "",
      `Покупатель: ${name}`,
      `Телефон: ${phone}`,
      email ? `Email: ${email}` : null,
      `Оплата: ${payment}`,
      comment ? `Комментарий: ${comment}` : null,
      "",
      "(расчёт доставки предварительный, прошу подтвердить)",
    ]
      .filter((row): row is string => row !== null)
      .join("\n");
  };

  const submit = (event: Event) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 2) nextErrors.name = "Как к вам обращаться?";
    if (digitsOf(phone).length < 10) nextErrors.phone = "Телефон нужен для связи по заказу";
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) nextErrors.email = "Проверьте адрес почты";
    if (!agreed) nextErrors.agreed = "Без согласия мы не можем обработать заказ";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const orderNumber = makeOrderNumber();
    const text = composeOrderText(orderNumber);
    const { link, channelLabel } = buildOrderLink(delivery?.orderChannel, delivery?.orderContact, storeName, text);

    // Telegram has no way to prefill a message, so the text goes to the clipboard first and the
    // done screen tells the buyer to paste it. Best-effort: a blocked clipboard is not an error.
    if (delivery?.orderChannel === "telegram") {
      navigator.clipboard?.writeText(text).catch(() => undefined);
    }
    if (link) window.open(link, "_blank", "noopener");

    setOrder({ number: orderNumber, text, link, channelLabel });
    setStep("done");
    cart.clear();
  };

  const copyOrder = async () => {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* Clipboard blocked (http, older Safari) — the text is on screen and selectable anyway. */
    }
  };

  const startOver = () => {
    setOrder(null);
    setStep("cart");
    setOpen(false);
  };

  const stepIndex = STEPS.indexOf(step);

  return (
    <>
      {/* Floating bubble: the cart is otherwise only reachable from the header, which scrolls
          away on mobile. Pops in the moment the first item lands. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Открыть корзину, ${count} ${pluralize(count, ["товар", "товара", "товаров"])}`}
        class={`vt-bubble ${count > 0 && !open ? "is-shown" : ""}`}
      >
        <span class="vt-bubble-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="20" height="20">
            <path d="M4 5h2l2.2 10.2a2 2 0 0 0 2 1.6h7a2 2 0 0 0 2-1.5L21 8H7" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="10" cy="20" r="1.4" fill="currentColor" stroke="none" />
            <circle cx="17.5" cy="20" r="1.4" fill="currentColor" stroke="none" />
          </svg>
          <span class="vt-bubble-count">{count}</span>
        </span>
        <span class="vt-bubble-total">{formatPrice(subtotal)}</span>
      </button>

      <div class={`vt-backdrop ${open ? "is-open" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />

      <aside class={`vt-drawer ${open ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Корзина и оформление заказа">
        <header class="vt-drawer-head">
          <div class="flex items-center gap-3">
            {step !== "cart" && step !== "done" && (
              <button type="button" class="vt-icon-btn" onClick={() => setStep(step === "contacts" ? "delivery" : "cart")} aria-label="Назад">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                  <path d="M15 5l-7 7 7 7" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            )}
            <div>
              <p class="vt-drawer-title">{STEP_TITLES[step]}</p>
              {step !== "done" && (
                <p class="vt-drawer-sub">
                  {count > 0 ? `${count} ${pluralize(count, ["товар", "товара", "товаров"])} · ${formatPrice(subtotal)}` : "пока пусто"}
                </p>
              )}
            </div>
          </div>
          <button type="button" class="vt-icon-btn" onClick={() => setOpen(false)} aria-label="Закрыть">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
            </svg>
          </button>
        </header>

        {step !== "done" && (
          <div class="vt-progress" aria-hidden="true">
            {STEPS.map((_, i) => (
              <span class={`vt-progress-seg ${i <= stepIndex ? "is-done" : ""}`} />
            ))}
          </div>
        )}

        {/* `key` on the scroller restarts the enter animation on every step change, so the panel
            reads as one flow rather than a form that swaps its contents in place. */}
        <div class="vt-drawer-body" key={step}>
          {step === "cart" && (
            <CartStepView lines={lines} cart={cart} />
          )}

          {step === "delivery" && (
            <div class="vt-stack">
              <label class="vt-field">
                <span class="vt-label">Город доставки</span>
                <input
                  class="vt-input"
                  value={cityQuery}
                  placeholder="Начните вводить, например «Каз»"
                  autocomplete="off"
                  onInput={(event: Event) => {
                    const value = (event.target as HTMLInputElement).value;
                    setCityQuery(value);
                    setShowSuggestions(true);
                    setCity(findCity(value));
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {suggestions.length > 0 && (
                  <ul class="vt-suggest">
                    {suggestions.map((suggestion) => (
                      <li>
                        {/* onMouseDown, not onClick: the input's blur would tear the list down first. */}
                        <button type="button" onMouseDown={() => pickCity(suggestion)}>
                          {suggestion.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {errors.city && <span class="vt-error">{errors.city}</span>}
              </label>

              <div class="vt-stack-sm">
                <span class="vt-label">Способ доставки</span>
                {DELIVERY_METHODS.map((option) => {
                  const optionQuote = quoteDelivery({
                    city,
                    method: option.id,
                    weightKg: weight,
                    subtotal,
                    basePrice: delivery?.basePrice,
                    freeFrom: delivery?.freeFrom,
                  });
                  return (
                    <label class={`vt-choice ${method === option.id ? "is-active" : ""}`}>
                      <input type="radio" name="delivery-method" checked={method === option.id} onChange={() => setMethod(option.id)} />
                      <span class="vt-choice-body">
                        <span class="vt-choice-title">{option.label}</span>
                        <span class="vt-choice-hint">{option.hint}</span>
                      </span>
                      <span class="vt-choice-price">
                        {optionQuote ? (
                          <>
                            <b>{optionQuote.isFree ? "бесплатно" : formatPrice(optionQuote.price)}</b>
                            <i>{optionQuote.days}</i>
                          </>
                        ) : (
                          <i>укажите город</i>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>

              {method === "pvz" && city && (
                <div class="vt-stack-sm">
                  <span class="vt-label">Пункт выдачи СДЭК</span>
                  {pickupPoints.length > 0 ? (
                    pickupPoints.map((point, i) => (
                      <label class={`vt-choice ${pickupIndex === i ? "is-active" : ""}`}>
                        <input type="radio" name="pickup-point" checked={pickupIndex === i} onChange={() => setPickupIndex(i)} />
                        <span class="vt-choice-body">
                          <span class="vt-choice-title">{point.address}</span>
                          <span class="vt-choice-hint">{[point.hours, point.note].filter(Boolean).join(" · ")}</span>
                        </span>
                      </label>
                    ))
                  ) : (
                    // No curated points for this city: send the buyer to СДЭК's own map rather than
                    // inventing an address that does not exist.
                    <p class="vt-note">
                      Для города «{city.name}» подберём ближайший пункт при подтверждении заказа. Можно выбрать самому на{" "}
                      <a href="https://www.cdek.ru/ru/offices" target="_blank" rel="noopener noreferrer">
                        карте пунктов СДЭК
                      </a>{" "}
                      и написать адрес в комментарии.
                    </p>
                  )}
                </div>
              )}

              {quote && quote.freeIn > 0 && (
                <p class="vt-note vt-note-accent">
                  До бесплатной доставки не хватает {formatPrice(quote.freeIn)}.
                </p>
              )}
              {delivery?.processingDays && <p class="vt-note">Собираем и передаём в СДЭК за {delivery.processingDays}.</p>}
              <p class="vt-note vt-note-quiet">{DELIVERY_DISCLAIMER}</p>
            </div>
          )}

          {step === "contacts" && (
            <form class="vt-stack" onSubmit={submit} id="vt-checkout-form" novalidate>
              <label class="vt-field">
                <span class="vt-label">Имя</span>
                <input class="vt-input" value={name} onInput={(e: Event) => setName((e.target as HTMLInputElement).value)} placeholder="Анна" />
                {errors.name && <span class="vt-error">{errors.name}</span>}
              </label>
              <label class="vt-field">
                <span class="vt-label">Телефон</span>
                <input
                  class="vt-input"
                  type="tel"
                  value={phone}
                  onInput={(e: Event) => setPhone((e.target as HTMLInputElement).value)}
                  placeholder="+7 999 123-45-67"
                />
                {errors.phone && <span class="vt-error">{errors.phone}</span>}
              </label>
              <label class="vt-field">
                <span class="vt-label">
                  Email <em>— необязательно</em>
                </span>
                <input class="vt-input" type="email" value={email} onInput={(e: Event) => setEmail((e.target as HTMLInputElement).value)} placeholder="anna@mail.ru" />
                {errors.email && <span class="vt-error">{errors.email}</span>}
              </label>

              <div class="vt-stack-sm">
                <span class="vt-label">Оплата</span>
                <div class="vt-chips">
                  {(delivery?.paymentMethods ?? []).map((option) => (
                    <button type="button" class={`vt-chip ${payment === option ? "is-active" : ""}`} onClick={() => setPayment(option)}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <label class="vt-field">
                <span class="vt-label">
                  Комментарий <em>— необязательно</em>
                </span>
                <textarea
                  class="vt-input vt-textarea"
                  rows={3}
                  value={comment}
                  onInput={(e: Event) => setComment((e.target as HTMLTextAreaElement).value)}
                  placeholder="Адрес пункта выдачи, пожелания по упаковке…"
                />
              </label>

              <label class="vt-agree">
                <input type="checkbox" checked={agreed} onChange={(e: Event) => setAgreed((e.target as HTMLInputElement).checked)} />
                <span>Согласен на обработку персональных данных для оформления заказа</span>
              </label>
              {errors.agreed && <span class="vt-error">{errors.agreed}</span>}

              <div class="vt-summary">
                <div>
                  <span>Товары</span>
                  <b>{formatPrice(subtotal)}</b>
                </div>
                <div>
                  <span>Доставка {city ? `· ${city.name}` : ""}</span>
                  <b>{quote ? (quote.isFree ? "бесплатно" : formatPrice(quote.price)) : "—"}</b>
                </div>
                <div class="vt-summary-total">
                  <span>Итого</span>
                  <b>{formatPrice(total)}</b>
                </div>
              </div>
            </form>
          )}

          {step === "done" && order && (
            <div class="vt-stack vt-done">
              <div class="vt-done-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="28" height="28">
                  <path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
              <h3 class="vt-done-title">Заказ {order.number} собран</h3>
              <p class="vt-note">
                {order.link
                  ? `Мы открыли переписку ${order.channelLabel} с готовым текстом заказа — отправьте сообщение, и менеджер подтвердит наличие, точную стоимость доставки СДЭК и пришлёт трек-номер.`
                  : "Скопируйте текст заказа ниже и отправьте его нам любым удобным способом — менеджер подтвердит наличие, стоимость доставки и пришлёт трек-номер."}
              </p>

              <pre class="vt-order-text">{order.text}</pre>

              <div class="vt-done-actions">
                <button type="button" class="vt-btn vt-btn-primary" onClick={copyOrder}>
                  {copied ? "Скопировано ✓" : "Скопировать заказ"}
                </button>
                {order.link && (
                  <a class="vt-btn vt-btn-ghost" href={order.link} target="_blank" rel="noopener noreferrer">
                    Открыть переписку
                  </a>
                )}
              </div>

              <p class="vt-note vt-note-quiet">
                Отследить посылку можно на{" "}
                <a href="https://www.cdek.ru/ru/tracking" target="_blank" rel="noopener noreferrer">
                  cdek.ru
                </a>{" "}
                — по трек-номеру из ответного сообщения.
              </p>
              <button type="button" class="vt-btn vt-btn-ghost" onClick={startOver}>
                Вернуться в магазин
              </button>
            </div>
          )}
        </div>

        {step !== "done" && (
          <footer class="vt-drawer-foot">
            {step === "cart" && (
              <>
                <div class="vt-foot-row">
                  <span>Товары</span>
                  <b>{formatPrice(subtotal)}</b>
                </div>
                <button type="button" class="vt-btn vt-btn-primary vt-btn-block" disabled={lines.length === 0} onClick={goToDelivery}>
                  Перейти к доставке
                </button>
              </>
            )}
            {step === "delivery" && (
              <>
                <div class="vt-foot-row">
                  <span>Итого с доставкой</span>
                  <b>{formatPrice(total)}</b>
                </div>
                <button type="button" class="vt-btn vt-btn-primary vt-btn-block" onClick={goToContacts}>
                  Перейти к оформлению
                </button>
              </>
            )}
            {step === "contacts" && (
              <button type="submit" form="vt-checkout-form" class="vt-btn vt-btn-primary vt-btn-block">
                Оформить заказ · {formatPrice(total)}
              </button>
            )}
          </footer>
        )}
      </aside>
    </>
  );
}

function CartStepView({ lines, cart }: { lines: CartLine[]; cart: CartStore }) {
  if (lines.length === 0) {
    return (
      <div class="vt-empty">
        <div class="vt-empty-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" width="34" height="34">
            <path d="M4 5h2l2.2 10.2a2 2 0 0 0 2 1.6h7a2 2 0 0 0 2-1.5L21 8H7" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="10" cy="20" r="1.4" fill="currentColor" stroke="none" />
            <circle cx="17.5" cy="20" r="1.4" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <p class="vt-empty-title">В корзине пока пусто</p>
        <p class="vt-note">Добавьте товары из каталога — расчёт доставки СДЭК появится на следующем шаге.</p>
      </div>
    );
  }

  return (
    <ul class="vt-lines">
      {lines.map((line) => (
        <li class="vt-line" key={line.id}>
          {line.photo ? <img class="vt-line-photo" src={line.photo} alt="" loading="lazy" /> : <div class="vt-line-photo vt-line-photo-empty" />}
          <div class="vt-line-body">
            <p class="vt-line-name">{line.name}</p>
            <p class="vt-line-price">{formatPrice(line.price)} / шт</p>
            <div class="vt-qty">
              <button type="button" onClick={() => cart.setQty(line.id, line.qty - 1)} aria-label="Убрать одну штуку">
                −
              </button>
              <span>{line.qty}</span>
              <button type="button" onClick={() => cart.setQty(line.id, line.qty + 1)} aria-label="Добавить одну штуку">
                +
              </button>
            </div>
          </div>
          <div class="vt-line-side">
            <b>{formatPrice(line.price * line.qty)}</b>
            <button type="button" class="vt-line-remove" onClick={() => cart.remove(line.id)} aria-label={`Удалить ${line.name}`}>
              Удалить
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

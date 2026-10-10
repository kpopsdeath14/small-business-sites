import { cart, items, rub, bindLines, renderLines, rollPrice, BASE, pimg } from "./cart";

const root = document.documentElement;
const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(
  (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
  { rootMargin: "0px 0px 8% 0px", threshold: 0 },
);
// clip-path hides a [data-wipe] element from IntersectionObserver, so watch its parent instead
const wipes = new Map<Element, Element[]>();
const wio = new IntersectionObserver(
  (es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    wipes.get(e.target)?.forEach((w, i) => { (w as HTMLElement).style.transitionDelay ||= `${Math.min(i, 4) * 0.08}s`; w.classList.add("in"); });
    wio.unobserve(e.target);
  }),
  { rootMargin: "0px 0px 6% 0px", threshold: 0 },
);
export const observe = (el: ParentNode = document) => {
  $$("[data-in]", el).forEach((n) => io.observe(n));
  $$("[data-wipe]", el).forEach((n) => {
    const p = n.parentElement!;
    if (!wipes.has(p)) { wipes.set(p, []); wio.observe(p); }
    wipes.get(p)!.push(n);
  });
};
observe();

/* ---------- menu ---------- */
const burger = $<HTMLButtonElement>(".burger")!;
const menu = $("#menu")!;
const setMenu = (open: boolean) => {
  root.classList.toggle("menu-open", open);
  burger.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-hidden", String(!open));
};
burger.addEventListener("click", () => setMenu(!root.classList.contains("menu-open")));
$$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

/* ---------- cart drawer (opens only on purpose: the header icon) ---------- */
const drawer = $(".drawer")!;
const list = $("[data-cart-list]", drawer)!;
const CHECKOUT_URL = `${BASE}/checkout/`;
export const openCart = () => {
  setMenu(false);
  hideCard();
  root.classList.add("drawer-open");
  drawer.setAttribute("aria-hidden", "false");
};
const closeCart = () => { root.classList.remove("drawer-open"); drawer.setAttribute("aria-hidden", "true"); };
$$("[data-close-cart]").forEach((b) => b.addEventListener("click", closeCart));
addEventListener("keydown", (e) => { if (e.key === "Escape") { closeCart(); setMenu(false); } });
const onCartPage = /\/(cart|checkout)\/?$/.test(location.pathname);
const onCheckout = /\/checkout\/?$/.test(location.pathname);
$$("[data-open-cart]").forEach((a) => a.addEventListener("click", (e) => { if (!onCartPage) { e.preventDefault(); openCart(); } }));
bindLines(list);

let lastCount = cart.count();
let lastBottles = cart.bottles();
function renderCart() {
  const n = cart.count();
  $$("[data-cart-count]").forEach((el) => {
    el.textContent = String(n);
    el.classList.toggle("on", n > 0);
    if (n > lastCount) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
  });
  $$("[data-cart-count-text]").forEach((el) => (el.textContent = String(n)));
  $$("[data-cart-total]").forEach((el) => rollPrice(el, cart.total()));
  $$("[data-cart-bottles]").forEach((el) => (el.textContent = cart.bottles() ? `${cart.bottles()} бут.` : ""));
  renderLines(list, { compact: true });
  if (!cart.lines().length) list.innerHTML = `<p class="lead" style="padding:28px 0">Стеллаж пока пуст — начните с винного шкафа.</p>`;
  $(".drawer__foot", drawer)!.hidden = !cart.lines().length;
  syncButtons();
  const b = cart.bottles();
  if (n < lastCount && !onCheckout) note("remove");
  else if (b >= 300 && lastBottles < 300) noteLater("cellar", 1600);
  lastCount = n;
  lastBottles = b;
}
document.addEventListener("cart:change", renderCart);

/* ---------- sommelier's notes: short, useful, each at most once per visit ---------- */
type Note = { q: string; t: string };
export const NOTES: Record<string, Note> = {
  remove: { q: "Не спешите — вино тоже не торопится.", t: "Позиция убрана из корзины" },
  zones: { q: "Две зоны: белое — к столу, красное — на выдержку.", t: "В нижней зоне держите 12–14 °C, в верхней — 6–10 °C" },
  cellar: { q: "Это уже погреб, а не шкаф.", t: "От 300 бутылок выгоднее спроектировать погреб под ключ — посчитаем бесплатно" },
  focus: { q: "Хорошее вино любит тишину.", t: "Не отвлекаем — заполняйте спокойно" },
  flag: { q: "Минутку.", t: "Проверьте отмеченные поля" },
};
const ONCE = new Set(["remove", "zones", "cellar", "focus"]);
const noteEl = $(".note")!;
let noteT = 0, noteSeq = 0;
export function noteLater(key: string, delay: number) {
  const seq = noteSeq;
  setTimeout(() => { if (seq === noteSeq) note(key); }, delay);
}
export function note(key: string) {
  if (ONCE.has(key)) {
    try {
      const k = `bacchus-note-${key}`;
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, "1");
    } catch {}
  }
  const l = NOTES[key];
  if (!l) return;
  noteSeq++;
  $(".note__q", noteEl)!.textContent = l.q;
  $(".note__t", noteEl)!.textContent = l.t;
  noteEl.classList.remove("on"); void noteEl.offsetWidth; noteEl.classList.add("on");
  clearTimeout(noteT);
  noteT = window.setTimeout(() => noteEl.classList.remove("on"), 4200);
}

/* ---------- buttons remember what is already in the cart ---------- */
const CHECK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>';
export function syncButtons() {
  const ids = new Map(cart.lines().map((l) => [l.id, l.q]));
  $$("[data-add]").forEach((b) => {
    if (!b.dataset.html) b.dataset.html = b.innerHTML;
    const q = ids.get(b.dataset.add!);
    const inCart = q !== undefined;
    if (inCart === b.classList.contains("in-cart")) return;
    b.classList.toggle("in-cart", inCart);
    if (!inCart) { b.innerHTML = b.dataset.html; return; }
    b.innerHTML = b.classList.contains("btn") ? `<span class="lamp"></span><span>В корзине</span><span class="btn__go">Оформить →</span>` : CHECK;
  });
  document.dispatchEvent(new CustomEvent("cart:sync"));
}

/* ---------- add to cart: the rack fills, the cellar card counts the bottles, a tiny buzz ---------- */
document.addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-add]");
  if (!b) return;
  e.preventDefault();
  if (b.classList.contains("in-cart")) {
    if (b.classList.contains("btn")) location.href = CHECKOUT_URL;
    else openCart();
    return;
  }
  const id = b.dataset.add!;
  if (!items[id]) return;
  const before = cart.bottles();
  cart.add(id, Number(b.dataset.qty || 1));
  haptic();
  pour();
  cellarCard(id, before);
  if (items[id].z === 2) noteLater("zones", 1800);
});

/** Short haptic tick: Vibration API on Android; on iOS 18+ a hidden native switch plays the system haptic. */
function haptic() {
  if (typeof navigator.vibrate === "function") { try { navigator.vibrate(12); } catch {} return; }
  try {
    const l = document.createElement("label"); l.style.display = "none"; l.ariaHidden = "true";
    const i = document.createElement("input"); i.type = "checkbox"; i.setAttribute("switch", "");
    l.appendChild(i); document.head.appendChild(l); l.click(); l.remove();
  } catch {}
}

const card = $(".cc")!;
let cardT = 0, cardRaf = 0;
function hideCard() { card.classList.remove("on"); clearTimeout(cardT); }
function cellarCard(id: string, before: number) {
  const it = items[id];
  $<HTMLImageElement>(".cc__img img", card)!.src = pimg(it.i);
  $(".cc__n", card)!.textContent = it.n;
  const out = $(".cc__b", card)!;
  cancelAnimationFrame(cardRaf);
  const after = cart.bottles();
  if (it.b) {
    // the cellar grows: count from what was there to what will be
    const t0 = performance.now();
    const run = (t: number) => {
      const k = Math.min(1, (t - t0) / 900), v = Math.round(before + (after - before) * (1 - Math.pow(1 - k, 3)));
      out.textContent = `Ваш погреб · ${v} бут.`;
      if (k < 1) cardRaf = requestAnimationFrame(run);
    };
    cardRaf = requestAnimationFrame(run);
  } else out.textContent = it.v || rub(it.p);
  card.classList.remove("on"); void card.offsetWidth; card.classList.add("on");
  clearTimeout(cardT);
  cardT = window.setTimeout(hideCard, 4200);
}
card.addEventListener("mouseenter", () => clearTimeout(cardT));
card.addEventListener("mouseleave", () => (cardT = window.setTimeout(hideCard, 1600)));
$(".cc__x", card)!.addEventListener("click", hideCard);

/* ---------- rack: scroll progress, bottle by bottle ---------- */
const rack = $(".rack");
const ends = rack ? $$("i", rack) : [];
function pour() {
  if (!rack) return;
  rack.classList.remove("pour"); void rack.offsetWidth; rack.classList.add("pour");
  setTimeout(() => rack.classList.remove("pour"), 1000);
}
let rackTick = false;
const fill = () => {
  rackTick = false;
  const max = root.scrollHeight - innerHeight;
  const p = max > 0 ? scrollY / max : 0;
  const n = Math.round(p * ends.length);
  ends.forEach((l, i) => l.classList.toggle("on", i < n));
  rack!.classList.toggle("full", p > 0.995 && max > innerHeight * 0.6);
};
if (rack) {
  addEventListener("scroll", () => { if (!rackTick) { rackTick = true; requestAnimationFrame(fill); } }, { passive: true });
  addEventListener("resize", fill);
  fill();
}

renderCart();
export { rub };

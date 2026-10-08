import { cart, items, rub, bindLines, renderLines, updateTrack, rollPrice, FREE } from "./cart";

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
const BASE = (document.querySelector('link[rel="icon"]') as HTMLLinkElement).getAttribute("href")!.replace(/\/favicon\.svg$/, "");
const CHECKOUT_URL = `${BASE}/checkout/`;
export const openCart = () => {
  setMenu(false);
  hidePit();
  root.classList.add("drawer-open");
  drawer.setAttribute("aria-hidden", "false");
};
const closeCart = () => { root.classList.remove("drawer-open"); drawer.setAttribute("aria-hidden", "true"); };
$$("[data-close-cart]").forEach((b) => b.addEventListener("click", closeCart));
addEventListener("keydown", (e) => { if (e.key === "Escape") { closeCart(); setMenu(false); } });
const onCartPage = /\/(cart|checkout)\/?$/.test(location.pathname);
const onCheckout = /\/checkout\/?$/.test(location.pathname);
$$("[data-open-cart]").forEach((a) =>
  a.addEventListener("click", (e) => { if (!onCartPage) { e.preventDefault(); openCart(); } }),
);
bindLines(list);

let lastCount = cart.count();
let lastTotal = cart.total();
function renderCart() {
  const n = cart.count();
  $$("[data-cart-count]").forEach((el) => {
    el.textContent = String(n);
    el.classList.toggle("on", n > 0);
    if (n > lastCount) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
  });
  $$("[data-cart-count-text]").forEach((el) => (el.textContent = String(n)));
  $$("[data-cart-total]").forEach((el) => rollPrice(el, cart.total()));
  const ls = cart.lines();
  renderLines(list, { compact: true });
  if (!ls.length) list.innerHTML = `<p class="lead" style="padding:28px 0"><span class="bwoah">«Bwoah.»</span> В боксах пока пусто — начните с кокпита.</p>`;
  const tr = $("[data-track]", drawer);
  if (tr) updateTrack(tr, cart.total());
  $(".drawer__foot", drawer)!.hidden = !ls.length;
  syncButtons();
  const tot = cart.total();
  if (n < lastCount && !onCheckout) radio("remove");
  else if (tot >= FREE && lastTotal < FREE && lastTotal > 0) radioLater("free", 900);
  lastCount = n;
  lastTotal = tot;
}
document.addEventListener("cart:change", renderCart);

/* ---------- team radio: famous lines, credited by car number only ---------- */
type Line = { no: string; q: string; t: string };
export const RADIO: Record<string, Line> = {
  remove: { no: "16", q: "No, no, no, no, no!", t: "Позиция удалена из корзины" },
  free: { no: "44", q: "Get in there!", t: "Доставка теперь бесплатная" },
  focus: { no: "7", q: "Leave me alone, I know what I'm doing.", t: "Не отвлекаем — заполняйте спокойно" },
  flag: { no: "", q: "Жёлтый флаг", t: "Проверьте отмеченные поля" },
};
const ADD: Line[] = [
  { no: "33", q: "Simply lovely.", t: "Добавлено в корзину" },
  { no: "44", q: "Get in there!", t: "Добавлено в корзину" },
];
const radioEl = $(".radio")!;
let radioT = 0;
let radioSeq = 0;
/** Fire a line after `delay` ms, unless another line went out meanwhile. */
export function radioLater(key: string, delay: number) {
  const seq = radioSeq;
  setTimeout(() => { if (seq === radioSeq) radio(key); }, delay);
}
const ONCE = new Set(["remove", "free", "focus"]);
export function radio(key: string | Line) {
  if (typeof key === "string" && ONCE.has(key)) {
    try {
      const k = `rseat-radio-${key}`;
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, "1");
    } catch {}
  }
  radioSeq++;
  const l = typeof key === "string" ? RADIO[key] : key;
  if (!l) return;
  $(".radio__no", radioEl)!.textContent = l.no ? `#${l.no}` : "";
  radioEl.classList.toggle("radio--flag", !l.no);
  $(".radio__q", radioEl)!.textContent = l.no ? `«${l.q}»` : l.q;
  $(".radio__t", radioEl)!.textContent = l.t;
  radioEl.classList.remove("on"); void radioEl.offsetWidth; radioEl.classList.add("on");
  clearTimeout(radioT);
  radioT = window.setTimeout(() => radioEl.classList.remove("on"), 3400);
}

/* ---------- buttons remember what is already in the cart ---------- */
const CHECK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>';
export function syncButtons() {
  const ids = new Map(cart.lines().map((l) => [l.id, l.q]));
  $$("[data-add]").forEach((b) => {
    if (!b.dataset.html) b.dataset.html = b.innerHTML;
    const q = ids.get(b.dataset.add!);
    const inCart = q !== undefined;
    if (inCart === b.classList.contains("in-cart") && b.dataset.q === String(q ?? "")) return;
    b.classList.toggle("in-cart", inCart);
    b.dataset.q = String(q ?? "");
    if (!inCart) { b.innerHTML = b.dataset.html; return; }
    b.innerHTML = b.classList.contains("btn")
      ? `<span class="lamp"></span><span>В корзине</span><span class="btn__go">Оформить →</span>`
      : CHECK;
  });
  document.dispatchEvent(new CustomEvent("cart:sync"));
}

/* ---------- add to cart: pit board, green flash on the shift lights, a tiny buzz ---------- */
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
  const q = Number(b.dataset.qty || 1);
  if (!items[id]) return;
  cart.add(id, q);
  haptic();
  rpmFlash();
  pitBoard(id, q);
});

/**
 * A short tap of haptic feedback. Android: Vibration API. iPhone: Safari has no Vibration API,
 * but since iOS 18 toggling a native <input switch> plays a system haptic, so we click a hidden
 * one. Must run inside the user's tap handler (it does: called from the click listener).
 */
function haptic() {
  if (typeof navigator.vibrate === "function") { try { navigator.vibrate(14); } catch {} return; }
  try {
    const label = document.createElement("label");
    label.ariaHidden = "true";
    label.style.display = "none";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("switch", "");
    label.appendChild(input);
    document.head.appendChild(label);
    label.click();
    label.remove();
  } catch {}
}

const pit = $(".pit")!;
let pitT = 0, pitRaf = 0, addN = 0;
function hidePit() { pit.classList.remove("on"); clearTimeout(pitT); }
function pitBoard(id: string, q: number) {
  const it = items[id];
  $<HTMLImageElement>(".pit__img img", pit)!.src = `${BASE}/p/${it.i}-600.webp`;
  $(".pit__n", pit)!.textContent = it.n;
  $(".pit__v", pit)!.textContent = [it.v, q > 1 ? `${q} шт.` : ""].filter(Boolean).join(" · ");
  const r = ADD[addN++ % ADD.length];
  $(".pit__rq", pit)!.textContent = `#${r.no} · «${r.q}»`;
  const time = $(".pit__time", pit)!;
  const target = 1.9 + Math.random() * 0.8; // a decent stop is ~2 s
  time.classList.remove("best");
  pit.classList.remove("on"); void pit.offsetWidth; pit.classList.add("on");
  cancelAnimationFrame(pitRaf);
  const t0 = performance.now();
  const run = (t: number) => {
    const v = Math.min(target, ((t - t0) / 900) * target);
    time.textContent = v.toFixed(2);
    if (v < target) pitRaf = requestAnimationFrame(run);
    else if (target < 2.25) time.classList.add("best");
  };
  pitRaf = requestAnimationFrame(run);
  clearTimeout(pitT);
  pitT = window.setTimeout(hidePit, 4200);
}
pit.addEventListener("mouseenter", () => clearTimeout(pitT));
pit.addEventListener("mouseleave", () => (pitT = window.setTimeout(hidePit, 1600)));
$(".pit__x", pit)!.addEventListener("click", hidePit);

function rpmFlash() {
  const r = $(".rpm");
  if (!r) return;
  r.classList.remove("flash"); void r.offsetWidth; r.classList.add("flash");
  setTimeout(() => r.classList.remove("flash"), 1000);
}

renderCart();

/* ---------- shift lights: scroll progress as an F1 wheel rev bar ---------- */
const rpm = $(".rpm");
const leds = rpm ? $$("i", rpm) : [];
let rpmTick = false;
const revs = () => {
  rpmTick = false;
  const max = root.scrollHeight - innerHeight;
  const p = max > 0 ? scrollY / max : 0;
  const n = Math.round(p * leds.length);
  leds.forEach((l, i) => l.classList.toggle("on", i < n));
  rpm!.classList.toggle("limit", p > 0.995 && max > innerHeight * 0.6);
};
if (rpm) {
  addEventListener("scroll", () => { if (!rpmTick) { rpmTick = true; requestAnimationFrame(revs); } }, { passive: true });
  addEventListener("resize", revs);
  revs();
}

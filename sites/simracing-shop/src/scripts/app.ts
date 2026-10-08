import { cart, items, rub, lineHTML, bindLines } from "./cart";

const root = document.documentElement;
const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(
  (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
  { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
);
// clip-path hides a [data-wipe] element from IntersectionObserver, so watch its parent instead
const wipes = new Map<Element, Element[]>();
const wio = new IntersectionObserver(
  (es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    wipes.get(e.target)?.forEach((w, i) => { (w as HTMLElement).style.transitionDelay ||= `${Math.min(i, 4) * 0.08}s`; w.classList.add("in"); });
    wio.unobserve(e.target);
  }),
  { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
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

/* ---------- cart drawer ---------- */
const drawer = $(".drawer")!;
const list = $("[data-cart-list]", drawer)!;
export const openCart = () => {
  setMenu(false);
  root.classList.add("drawer-open");
  drawer.setAttribute("aria-hidden", "false");
};
const closeCart = () => { root.classList.remove("drawer-open"); drawer.setAttribute("aria-hidden", "true"); };
$$("[data-close-cart]").forEach((b) => b.addEventListener("click", closeCart));
addEventListener("keydown", (e) => { if (e.key === "Escape") { closeCart(); setMenu(false); } });
const onCartPage = /\/(cart|checkout)\/?$/.test(location.pathname);
$$("[data-open-cart]").forEach((a) =>
  a.addEventListener("click", (e) => { if (!onCartPage) { e.preventDefault(); openCart(); } }),
);
bindLines(list);

let lastCount = cart.count();
function renderCart() {
  const n = cart.count();
  $$("[data-cart-count]").forEach((el) => {
    el.textContent = String(n);
    el.classList.toggle("on", n > 0);
    if (n > lastCount) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
  });
  $$("[data-cart-count-text]").forEach((el) => (el.textContent = String(n)));
  $$("[data-cart-total]").forEach((el) => (el.textContent = rub(cart.total())));
  const ls = cart.lines();
  list.innerHTML = ls.length
    ? ls.map((l) => lineHTML(l, { compact: true })).join("")
    : `<p class="lead" style="padding:28px 0">Корзина пуста. Загляните в каталог — начните с кокпита.</p>`;
  $$(".drawer__foot .btn", drawer).forEach((b) => b.toggleAttribute("hidden", !ls.length));
  lastCount = n;
}
document.addEventListener("cart:change", renderCart);
renderCart();

/* ---------- toast ---------- */
const toastEl = $(".toast")!;
let toastT = 0;
export function toast(msg: string) {
  toastEl.textContent = msg;
  toastEl.classList.add("on");
  clearTimeout(toastT);
  toastT = window.setTimeout(() => toastEl.classList.remove("on"), 2400);
}

/* ---------- add to cart (any [data-add]) ---------- */
document.addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-add]");
  if (!b) return;
  e.preventDefault();
  const id = b.dataset.add!;
  const q = Number(b.dataset.qty || 1);
  if (!items[id]) return;
  cart.add(id, q);
  pitStop(b);
  if (b.dataset.mode === "drawer") setTimeout(openCart, 420);
  else toast(`В корзине · ${items[id].n}`);
});

/* "pit stop": the button lights a green lamp for a moment */
const CHECK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>';
function pitStop(b: HTMLElement) {
  if (b.classList.contains("is-added")) return;
  const html = b.innerHTML;
  b.classList.add("is-added");
  b.innerHTML = b.classList.contains("btn") ? '<span class="lamp"></span><span>В корзине</span>' : CHECK;
  setTimeout(() => { b.innerHTML = html; b.classList.remove("is-added"); }, 1500);
}

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

/* ---------- lap timer in the footer: time on the site this session ---------- */
const lapEl = $("[data-lap]");
if (lapEl) {
  let start = Date.now();
  try {
    const s = Number(sessionStorage.getItem("rseat-lap"));
    if (s) start = s; else sessionStorage.setItem("rseat-lap", String(start));
  } catch {}
  const fmt = (ms: number) => {
    const m = Math.floor(ms / 60000), sec = Math.floor((ms % 60000) / 1000), mil = ms % 1000;
    return `${m}:${String(sec).padStart(2, "0")}.${String(mil).padStart(3, "0")}`;
  };
  let vis = false;
  const loop = () => { if (!vis) return; lapEl.textContent = fmt(Date.now() - start); requestAnimationFrame(loop); };
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) loop(); }).observe(lapEl);
}

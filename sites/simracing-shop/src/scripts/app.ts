import { cart, items, rub, lineHTML, bindLines, afterRender, trackHTML } from "./cart";

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

/* ---------- cart drawer (opens only on purpose: the header icon) ---------- */
const drawer = $(".drawer")!;
const list = $("[data-cart-list]", drawer)!;
const BASE = (document.querySelector('link[rel="icon"]') as HTMLLinkElement).getAttribute("href")!.replace(/\/favicon\.svg$/, "");
const CART_URL = `${BASE}/cart/`;
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
    : `<p class="lead" style="padding:28px 0">В боксах пока пусто. Загляните в каталог — начните с кокпита.</p>`;
  afterRender(list);
  const tr = $("[data-track]", drawer);
  if (tr) tr.innerHTML = ls.length ? trackHTML(cart.total()) : "";
  $$(".drawer__foot .btn", drawer).forEach((b) => b.toggleAttribute("hidden", !ls.length));
  syncButtons();
  lastCount = n;
}
document.addEventListener("cart:change", renderCart);

/* ---------- toast ---------- */
const toastEl = $(".toast")!;
let toastT = 0;
export function toast(msg: string) {
  toastEl.textContent = msg;
  toastEl.classList.add("on");
  clearTimeout(toastT);
  toastT = window.setTimeout(() => toastEl.classList.remove("on"), 2400);
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
      ? `<span class="lamp"></span><span>В корзине${q! > 1 ? ` · ${q}` : ""}</span><span class="btn__go">Оформить →</span>`
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
    if (b.classList.contains("btn")) location.href = CART_URL;
    else openCart();
    return;
  }
  const id = b.dataset.add!;
  const q = Number(b.dataset.qty || 1);
  if (!items[id]) return;
  cart.add(id, q);
  try { navigator.vibrate?.(14); } catch {}
  rpmFlash();
  pitBoard(id, q);
});

const pit = $(".pit")!;
let pitT = 0, pitRaf = 0;
function hidePit() { pit.classList.remove("on"); clearTimeout(pitT); }
function pitBoard(id: string, q: number) {
  const it = items[id];
  $<HTMLImageElement>(".pit__img img", pit)!.src = `${BASE}/p/${it.i}-600.webp`;
  $(".pit__n", pit)!.textContent = it.n;
  $(".pit__v", pit)!.textContent = [it.v, q > 1 ? `${q} шт.` : ""].filter(Boolean).join(" · ");
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
  r.classList.remove("pit"); void r.offsetWidth; r.classList.add("pit");
  setTimeout(() => r.classList.remove("pit"), 900);
}

/* ---------- timing beam: a light sweeps across on every page change ---------- */
document.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
  if (!a || a.target || e.metaKey || e.ctrlKey) return;
  const u = new URL(a.href, location.href);
  if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return;
  try { sessionStorage.setItem("rseat-beam", "1"); } catch {}
});
try {
  if (sessionStorage.getItem("rseat-beam")) {
    sessionStorage.removeItem("rseat-beam");
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("beam-go");
      setTimeout(() => root.classList.remove("beam-go"), 1100);
    }
  }
} catch {}

/** A red light streak passes over an image stage — used when a colour changes. */
export function streak(el: HTMLElement) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const s = document.createElement("span");
  s.className = "streak";
  el.appendChild(s);
  s.addEventListener("animationend", () => s.remove());
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

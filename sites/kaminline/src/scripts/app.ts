import { cart, items, rub, bindLines, renderLines, rollPrice, BASE, pimg } from "./cart";
import "./embers";

const root = document.documentElement;
const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- reveal ---------- */
const io = new IntersectionObserver(
  (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
  { rootMargin: "0px 0px 6% 0px", threshold: 0 },
);
// clip-path hides [data-rise] from IntersectionObserver, so watch its parent
const rio = new IntersectionObserver(
  (es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    $$("[data-rise]", e.target).forEach((n) => n.classList.add("in"));
    rio.unobserve(e.target);
  }),
  { rootMargin: "0px 0px 4% 0px", threshold: 0 },
);
export const observe = (el: ParentNode = document) => {
  $$("[data-in]", el).forEach((n) => io.observe(n));
  new Set($$("[data-rise]", el).map((n) => n.parentElement!)).forEach((p) => rio.observe(p));
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

/* ---------- header over night sections + smouldering wick ---------- */
const hdr = $(".hdr")!;
const wick = $(".wick")!;
const nights = $$(".night");
let tick = false;
function onScroll() {
  tick = false;
  const y = scrollY, max = root.scrollHeight - innerHeight;
  const p = max > 0 ? Math.min(1, y / max) : 0;
  $("i", wick)!.style.transform = `scaleX(${p})`;
  $("b", wick)!.style.left = `${p * 100}%`;
  wick.classList.toggle("on", p > 0.01 && p < 0.995);
  const probe = hdr.offsetHeight / 2;
  hdr.classList.toggle("hdr--night", !root.classList.contains("menu-open") && nights.some((n) => { const r = n.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe; }));
}
addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener("resize", onScroll);
onScroll();

/* ---------- cart drawer (opens only from the header icon) ---------- */
const drawer = $(".drawer")!;
const list = $("[data-cart-list]", drawer)!;
const CHECKOUT = `${BASE}/checkout/`;
export const openCart = () => {
  setMenu(false); hideToast();
  root.classList.add("drawer-open");
  drawer.setAttribute("aria-hidden", "false");
};
const closeCart = () => { root.classList.remove("drawer-open"); drawer.setAttribute("aria-hidden", "true"); };
$$("[data-close-cart]").forEach((b) => b.addEventListener("click", closeCart));
addEventListener("keydown", (e) => { if (e.key === "Escape") { closeCart(); setMenu(false); } });
const onCartPage = /\/(cart|checkout)\/?$/.test(location.pathname);
$$("[data-open-cart]").forEach((a) => a.addEventListener("click", (e) => { if (!onCartPage) { e.preventDefault(); openCart(); } }));
bindLines(list);

let lastCount = cart.count();
function renderCart() {
  const n = cart.count();
  $$("[data-cart-count]").forEach((el) => { el.textContent = String(n); el.classList.toggle("on", n > 0); });
  $$("[data-cart-total]").forEach((el) => rollPrice(el, cart.total()));
  renderLines(list, { compact: true });
  if (!n) list.innerHTML = `<p class="lead" style="padding:28px 0">Здесь пока прохладно. Выберите камин — и станет теплее.</p>`;
  $(".drawer__foot", drawer)!.hidden = !n;
  syncButtons();
  lastCount = n;
}
document.addEventListener("cart:change", renderCart);

/* ---------- buttons remember what is already in the cart ---------- */
const CHECK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const FLAME = '<svg class="flame-ico" viewBox="0 0 14 16" aria-hidden="true"><path d="M7 15.5c2.6 0 4.4-1.7 4.4-4.1 0-2.5-1.9-3.8-2.5-6.2-.2 1.2-.8 2-1.6 2.4.1-2.1-.7-4.1-2.5-5.4.1 2.5-2.3 4.1-2.3 7.1 0 3.6 1.9 6.2 4.5 6.2z" fill="#f2a24a"/></svg>';
export function syncButtons() {
  const ids = new Map(cart.lines().map((l) => [l.id, l.q]));
  $$("[data-add]").forEach((b) => {
    if (!b.dataset.html) b.dataset.html = b.innerHTML;
    const q = ids.get(b.dataset.add!);
    const inCart = q !== undefined;
    if (inCart === b.classList.contains("in-cart")) return;
    b.classList.toggle("in-cart", inCart);
    if (!inCart) { b.innerHTML = b.dataset.html; return; }
    b.innerHTML = b.classList.contains("btn") ? `${FLAME}<span>В корзине</span><span class="btn__go">Оформить →</span>` : CHECK;
  });
  document.dispatchEvent(new CustomEvent("cart:sync"));
}

/* ---------- add to cart: an ember flies from the button into the cart ---------- */
document.addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-add]");
  if (!b) return;
  e.preventDefault();
  if (b.classList.contains("in-cart")) {
    if (b.classList.contains("btn")) location.href = CHECKOUT; else openCart();
    return;
  }
  const id = b.dataset.add!;
  if (!items[id]) return;
  cart.add(id, Number(b.dataset.qty || 1));
  haptic();
  flyEmber(b);
  showToast(id);
});

function flyEmber(from: HTMLElement) {
  const target = $("[data-open-cart]")!;
  if (reduced) { target.classList.add("warm"); return; }
  const a = from.getBoundingClientRect(), z = target.getBoundingClientRect();
  const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2, x1 = z.left + z.width / 2, y1 = z.top + z.height / 2;
  const s = document.createElement("span");
  s.className = "spark";
  document.body.appendChild(s);
  // a soft arc, rising like a spark from a fire
  const lift = Math.min(160, Math.abs(y0 - y1) * 0.5 + 60);
  const kf: Keyframe[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12, e = t * t * (3 - 2 * t);
    const x = x0 + (x1 - x0) * e + Math.sin(t * Math.PI * 3) * 8 * (1 - t);
    const y = y0 + (y1 - y0) * e - Math.sin(t * Math.PI) * lift;
    kf.push({ transform: `translate(${x}px, ${y}px) scale(${1.2 - t * 0.6})`, opacity: t > 0.92 ? 0 : 1 });
  }
  s.animate(kf, { duration: 820, easing: "linear" }).onfinish = () => {
    s.remove();
    target.classList.remove("warm"); void target.offsetWidth; target.classList.add("warm");
  };
}

const toast = $(".ember-toast")!;
let toastT = 0;
function hideToast() { toast.classList.remove("on"); clearTimeout(toastT); }
function showToast(id: string) {
  const it = items[id];
  $<HTMLImageElement>("img", toast)!.src = pimg(it.i);
  $(".ember-toast__n", toast)!.textContent = it.n + (it.v ? ` · ${it.v}` : "");
  toast.classList.remove("on"); void toast.offsetWidth; toast.classList.add("on");
  clearTimeout(toastT);
  toastT = window.setTimeout(hideToast, 4200);
}
toast.addEventListener("mouseenter", () => clearTimeout(toastT));
toast.addEventListener("mouseleave", () => (toastT = window.setTimeout(hideToast, 1500)));
$("[data-toast-x]", toast)?.addEventListener("click", hideToast);

/** Short haptic tick: Vibration API on Android; on iOS 18+ a hidden native switch plays the system haptic. */
function haptic() {
  if (typeof navigator.vibrate === "function") { try { navigator.vibrate(12); } catch {} return; }
  try {
    const l = document.createElement("label"); l.style.display = "none";
    const i = document.createElement("input"); i.type = "checkbox"; i.setAttribute("switch", "");
    l.appendChild(i); document.head.appendChild(l); l.click(); l.remove();
  } catch {}
}

renderCart();
export { rub };

import { cart, items, rub, bindLines, renderLines, rollPrice, BASE, pimg } from "./cart";

const root = document.documentElement;
const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];

/* ---------- reveal + kindle ---------- */
const io = new IntersectionObserver(
  (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
  { rootMargin: "0px 0px -8% 0px", threshold: 0 },
);
export const observe = (el: ParentNode = document) => $$("[data-in], [data-kindle]", el).forEach((n) => io.observe(n));
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
  if (!n) list.innerHTML = `<p class="lead" style="padding:30px 0">Корзина пуста.</p>`;
  $(".drawer__foot", drawer)!.hidden = !n;
  syncButtons();
  lastCount = n;
}
document.addEventListener("cart:change", renderCart);

/* ---------- buttons remember what is already in the cart ---------- */
const CHECK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
export function syncButtons() {
  const ids = new Map(cart.lines().map((l) => [l.id, l.q]));
  $$("[data-add]").forEach((b) => {
    if (!b.dataset.html) b.dataset.html = b.innerHTML;
    const q = ids.get(b.dataset.add!);
    const inCart = q !== undefined;
    if (inCart === b.classList.contains("in-cart")) return;
    b.classList.toggle("in-cart", inCart);
    if (!inCart) { b.innerHTML = b.dataset.html; return; }
    b.innerHTML = b.classList.contains("btn") ? `<span>В корзине</span><span class="btn__go">Оформить</span>` : CHECK;
  });
  document.dispatchEvent(new CustomEvent("cart:sync"));
}

/* ---------- add to cart ---------- */
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
  const t = $("[data-open-cart]")!;
  t.classList.remove("warm"); void t.offsetWidth; t.classList.add("warm");
  showToast(id);
});

const toast = $(".note")!;
let toastT = 0;
function hideToast() { toast.classList.remove("on"); clearTimeout(toastT); }
function showToast(id: string) {
  const it = items[id];
  $<HTMLImageElement>("img", toast)!.src = pimg(it.i);
  $(".note__n", toast)!.textContent = it.n + (it.v ? ` · ${it.v}` : "");
  toast.classList.remove("on"); void toast.offsetWidth; toast.classList.add("on");
  clearTimeout(toastT);
  toastT = window.setTimeout(hideToast, 4200);
}
toast.addEventListener("mouseenter", () => clearTimeout(toastT));
toast.addEventListener("mouseleave", () => (toastT = window.setTimeout(hideToast, 1500)));

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

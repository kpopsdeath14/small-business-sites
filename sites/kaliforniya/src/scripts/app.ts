// The cart: product id → { qty, variant }, kept in this browser.
export type Line = { id: string; qty: number; variant?: string };
const KEY = "kaliforniya-cart-v1";
const read = (): Line[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
let lines = read();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch {} document.dispatchEvent(new CustomEvent("cart:change")); };
export const cart = {
  get: () => lines.map((l) => ({ ...l })),
  add(id: string, variant?: string) { const l = lines.find((x) => x.id === id && x.variant === variant); if (l) l.qty++; else lines.push({ id, qty: 1, variant }); save(); },
  set(id: string, variant: string | undefined, qty: number) { lines = lines.map((l) => (l.id === id && l.variant === variant ? { ...l, qty } : l)).filter((l) => l.qty > 0); save(); },
  clear() { lines = []; save(); },
};

const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
export const observe = (el: ParentNode = document) => $$("[data-in]", el).forEach((n) => io.observe(n));
observe();

// header cart button: count and sum; prices come from the page's product table
const prices: Record<string, number> = (window as any).__prices || {};
export function setPrices(p: Record<string, number>) { Object.assign(prices, p); sync(); }
function sync() {
  const n = lines.reduce((s, l) => s + l.qty, 0);
  const sum = lines.reduce((s, l) => s + (prices[l.id] || 0) * l.qty, 0);
  $$("[data-cart-n]").forEach((e) => { e.textContent = String(n); e.classList.toggle("on", n > 0); });
  $$("[data-cart-sum]").forEach((e) => (e.textContent = Math.round(sum).toLocaleString("ru-RU") + " ₽"));
}
document.addEventListener("cart:change", sync);
sync();

const note = document.querySelector<HTMLElement>("[data-note]")!;
let noteT = 0;
export function noted(t: string, s: string, image?: string) {
  note.querySelector("[data-note-t]")!.textContent = t;
  note.querySelector("[data-note-s]")!.textContent = s;
  const im = note.querySelector<HTMLImageElement>("[data-note-img]")!;
  im.hidden = !image; if (image) im.src = image;
  note.classList.remove("on"); void note.offsetWidth; note.classList.add("on");
  clearTimeout(noteT); noteT = window.setTimeout(() => note.classList.remove("on"), 3800);
  const b = document.querySelector("[data-cart-btn]"); b?.classList.remove("bump"); void (b as HTMLElement)?.offsetWidth; b?.classList.add("bump");
}

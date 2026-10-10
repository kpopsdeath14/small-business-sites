// The estimate (смета) lives in this browser. Joinery is made to measure, so the "cart" is a list of
// items with their sizes, wood and quantity — exactly what a workshop needs to price an order.
export type Line = { id: string; kind: string; wood: string; w: number; h: number; q: number; price: number; label: string; spec: string; params?: Record<string, string | number> };
const KEY = "cips-smeta-v1";
const read = (): Line[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]") as Line[]; } catch { return []; } };
let lines = read();
const write = () => { try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch {} document.dispatchEvent(new CustomEvent("smeta:change")); };
export const smeta = {
  lines: () => lines.slice(),
  count: () => lines.reduce((s, l) => s + l.q, 0),
  add(l: Omit<Line, "id">) { lines.push({ ...l, id: Math.random().toString(36).slice(2, 8) }); write(); },
  set(id: string, q: number) { lines = q <= 0 ? lines.filter((l) => l.id !== id) : lines.map((l) => (l.id === id ? { ...l, q } : l)); write(); },
  clear() { lines = []; write(); },
};
addEventListener("storage", (e) => { if (e.key === KEY) { lines = read(); document.dispatchEvent(new CustomEvent("smeta:change")); } });

const root = document.documentElement;
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];

/* ---------- reveal; images are "planed" in from left to right ---------- */
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
const pio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { $$("[data-plane]", e.target).forEach((p) => p.parentElement === e.target && p.classList.add("in")); pio.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
export const observe = (el: ParentNode = document) => {
  $$("[data-in]", el).forEach((n) => io.observe(n));
  new Set($$("[data-plane]", el).map((n) => n.parentElement!)).forEach((p) => pio.observe(p));
};
observe();

/* ---------- menu: a pair of doors ---------- */
const menu = document.getElementById("menu")!;
const btn = document.querySelector<HTMLButtonElement>("[data-menu]")!;
const setMenu = (open: boolean) => { root.classList.toggle("menu-open", open); btn.setAttribute("aria-expanded", String(open)); menu.setAttribute("aria-hidden", String(!open)); };
btn.addEventListener("click", () => setMenu(true));
document.querySelector("[data-menu-close]")!.addEventListener("click", () => setMenu(false));
$$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

/* ---------- tape measure: the brass blade follows the scroll, reading in millimetres ---------- */
const tape = document.querySelector<HTMLElement>("[data-tape]")!;
const blade = document.querySelector<HTMLElement>("[data-blade]")!;
const mm = document.querySelector<HTMLElement>("[data-mm]")!;
let tick = false, hideT = 0;
const onScroll = () => {
  tick = false;
  const max = root.scrollHeight - innerHeight, p = max > 0 ? Math.min(1, scrollY / max) : 0;
  blade.style.width = `${(p * 100).toFixed(2)}%`;
  mm.style.left = `${(p * 100).toFixed(2)}%`;
  // the whole page reads as 5 metres of tape
  mm.textContent = `${Math.round(p * 5000)} мм`;
  tape.classList.add("on");
  clearTimeout(hideT); hideT = window.setTimeout(() => tape.classList.remove("on"), 900);
};
addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });

/* ---------- estimate counter and the note when something is added ---------- */
let last = smeta.count();
const render = () => {
  const n = smeta.count();
  $$("[data-cnt]").forEach((c) => { c.textContent = String(n); c.classList.toggle("on", n > 0); });
  last = n;
};
document.addEventListener("smeta:change", render);
render();
const note = document.querySelector<HTMLElement>("[data-note]")!;
let noteT = 0;
export function noted(t: string, s: string) {
  note.querySelector("[data-note-t]")!.textContent = t;
  note.querySelector("[data-note-s]")!.textContent = s;
  note.classList.remove("on"); void note.offsetWidth; note.classList.add("on");
  clearTimeout(noteT); noteT = window.setTimeout(() => note.classList.remove("on"), 4200);
}
void last;

// The kit lives in this browser (localStorage). A boat is not a basket item: one boat, one motor on its
// transom, one trailer under it. Choosing another boat replaces the first.
export type Slot = "boat" | "motor" | "trailer";
type Entry = { n: string; p: number; i: string; h: string; c: "boats" | "motors" | "trailers"; l: number | null; hp: [number, number] | null; w: number | null; ld: number | null };
const data = JSON.parse(document.getElementById("cart-index")!.textContent!) as { base: string; items: Record<string, Entry> };
export const BASE = data.base;
export const items = data.items;
export const slotOf = (id: string): Slot => (items[id].c === "boats" ? "boat" : items[id].c === "motors" ? "motor" : "trailer");
type Kit = Partial<Record<Slot, string>> & { last?: Slot; at?: number };
const KEY = "komandor-kit-v1";
const read = (): Kit => { try { const k = JSON.parse(localStorage.getItem(KEY) || "{}") as Kit; (["boat", "motor", "trailer"] as Slot[]).forEach((s) => { if (k[s] && !items[k[s]!]) delete k[s]; }); return k; } catch { return {}; } };
let state = read();
const write = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} document.dispatchEvent(new CustomEvent("cart:change")); };
export const kit = {
  get: () => ({ ...state }),
  has: (id: string) => Object.values(state).includes(id),
  count: () => (["boat", "motor", "trailer"] as Slot[]).filter((s) => state[s]).length,
  total: () => (["boat", "motor", "trailer"] as Slot[]).reduce((t, s) => t + (state[s] ? items[state[s]!].p : 0), 0),
  /** returns the id that was replaced, if any */
  put(id: string) { const s = slotOf(id); const was = state[s]; state[s] = id; state.last = s; state.at = Date.now(); write(); return was && was !== id ? was : undefined; },
  remove(s: Slot) { delete state[s]; if (state.last === s) delete state.last; write(); },
  clear() { state = {}; write(); },
};
// the old name stays for pages that only need the total
export const cart = { count: kit.count, total: kit.total, clear: kit.clear };
addEventListener("storage", (e) => { if (e.key === KEY) { state = read(); document.dispatchEvent(new CustomEvent("cart:change")); } });
export const rub = (n: number) => n.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽";
export const pimg = (id: string, w = 640) => `${BASE}/p/${id}-${w}.webp`;
export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

const root = document.documentElement;
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];

/* ---------- reveal: text fades up, images surface through a waterline ---------- */
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px 6% 0px" });
// clip-path hides [data-rise] from the observer, so watch its parent
const rio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { $$("[data-rise]", e.target).forEach((r) => r.parentElement === e.target && r.classList.add("in")); rio.unobserve(e.target); } }), { rootMargin: "0px 0px 6% 0px" });
export const observe = (el: ParentNode = document) => {
  $$("[data-in]", el).forEach((n) => io.observe(n));
  new Set($$("[data-rise]", el).map((n) => n.parentElement!)).forEach((p) => rio.observe(p));
};
observe();

/* ---------- counters and buttons that remember the kit ---------- */
let last = kit.count();
function render() {
  const n = kit.count();
  $$("[data-cnt]").forEach((c) => {
    c.textContent = String(n);
    c.classList.toggle("on", n > 0);
    if (n > last) { c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); }
  });
  last = n;
  syncButtons();
}
const DONE: Record<Slot, string> = { boat: "Катер на стапеле · комплект →", motor: "Мотор в комплекте · комплект →", trailer: "Прицеп в комплекте · комплект →" };
export function syncButtons() {
  $$("[data-add]").forEach((b) => {
    if (!b.dataset.html) b.dataset.html = b.innerHTML;
    const on = kit.has(b.dataset.add!);
    if (on === b.classList.contains("in-cart")) return;
    b.classList.toggle("in-cart", on);
    b.innerHTML = on ? (b.classList.contains("btn") ? DONE[slotOf(b.dataset.add!)] : "✓") : b.dataset.html;
  });
}
document.addEventListener("cart:change", render);
render();

/* ---------- choose: a line in the ship's log, worded for what was chosen ---------- */
const log = document.querySelector<HTMLElement>(".log")!;
let logT = 0;
const SAID: Record<Slot, [string, string]> = { boat: ["катер на стапеле", "заменил прежний катер"], motor: ["мотор на транце", "заменил прежний мотор"], trailer: ["прицеп подан", "заменил прежний прицеп"] };
document.addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-add]");
  if (!b) return;
  e.preventDefault();
  if (b.classList.contains("in-cart")) { location.href = `${BASE}/cart/`; return; }
  const id = b.dataset.add!;
  if (!items[id]) return;
  const replaced = kit.put(id);
  if (typeof navigator.vibrate === "function") try { navigator.vibrate(12); } catch {}
  const it = items[id], s = slotOf(id);
  log.querySelector("img")!.src = pimg(it.i);
  log.querySelector("[data-log-n]")!.textContent = it.n;
  log.querySelector("[data-log-what]")!.textContent = replaced ? SAID[s][1] : SAID[s][0];
  const d = new Date();
  log.querySelector("[data-log-time]")!.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  log.classList.remove("on"); void log.offsetWidth; log.classList.add("on");
  clearTimeout(logT); logT = window.setTimeout(() => log.classList.remove("on"), 4200);
});

/* ---------- scroll: echo sounder on the rail, a wake along the dock ---------- */
const sonar = document.querySelector<HTMLElement>("[data-sonar]");
const depth = document.querySelector<HTMLElement>("[data-depth]");
const wake = document.querySelector<HTMLElement>("[data-wake]");
let tick = false;
const onScroll = () => {
  tick = false;
  const max = root.scrollHeight - innerHeight, p = max > 0 ? Math.min(1, scrollY / max) : 0;
  if (sonar) sonar.style.transform = `scaleY(${p})`;
  if (depth) depth.textContent = (p * 12).toFixed(1).replace(".", ",");
  if (wake) wake.style.transform = `scaleX(${p})`;
};
addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

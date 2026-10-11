// A sauna is bought one at a time: the "cart" is one sauna (a model or your own size) with its options.
export type Kit = { base: string; w: number; d: number; h: number; wood: string; light: string[]; steam: boolean; at?: number };
const KEY = "its-sauna-kit-v1";
const read = (): Kit | null => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } };
let kit = read();
export const store = {
  get: () => (kit ? { ...kit, light: [...kit.light] } : null),
  set(k: Kit) { kit = { ...k, at: Date.now() }; try { localStorage.setItem(KEY, JSON.stringify(kit)); } catch {} document.dispatchEvent(new CustomEvent("kit:change")); },
  clear() { kit = null; try { localStorage.removeItem(KEY); } catch {} document.dispatchEvent(new CustomEvent("kit:change")); },
};

const root = document.documentElement;
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];

/* ---------- reveal ---------- */
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
export const observe = (el: ParentNode = document) => $$("[data-in]", el).forEach((n) => io.observe(n));
observe();

/* ---------- menu: the bench ---------- */
const menu = document.getElementById("menu")!;
const btn = document.querySelector<HTMLButtonElement>("[data-menu]")!;
const setMenu = (o: boolean) => { root.classList.toggle("menu-open", o); btn.setAttribute("aria-expanded", String(o)); menu.setAttribute("aria-hidden", String(!o)); };
btn.addEventListener("click", () => setMenu(true));
$$("[data-menu-close]").forEach((b) => b.addEventListener("click", () => setMenu(false)));
$$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

/* ---------- header: clear over dark rooms, solid over the light ones ---------- */
const hdr = document.querySelector<HTMLElement>("[data-hdr]")!;
const darks = $$(".dark");
let tick = false;
const frame = () => {
  tick = false;
  const y = hdr.offsetHeight / 2;
  const overDark = darks.some((d) => { const r = d.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
  hdr.classList.toggle("on-dark", overDark);
  hdr.classList.toggle("solid", scrollY > 20 && !overDark);
  hdr.classList.toggle("scrolled", scrollY > 20);
};
addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
frame();

/* ---------- the ladle in the header gets a dot once a sauna is chosen ---------- */
const sync = () => $$("[data-dot]").forEach((c) => c.classList.toggle("on", !!store.get()));
document.addEventListener("kit:change", sync);
sync();

const note = document.querySelector<HTMLElement>("[data-note]")!;
let noteT = 0;
export function noted(t: string, s: string) {
  note.querySelector("[data-note-t]")!.textContent = t;
  note.querySelector("[data-note-s]")!.textContent = s;
  note.classList.remove("on"); void note.offsetWidth; note.classList.add("on");
  clearTimeout(noteT); noteT = window.setTimeout(() => note.classList.remove("on"), 4200);
}

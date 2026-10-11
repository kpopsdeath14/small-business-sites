// A hot tub is bought one at a time: the "cart" is one tub with its options, kept in this browser.
export type Kit = { model: string; wood: string; options: string[]; at?: number };
const KEY = "polarspa-kit-v1";
const read = (): Kit | null => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } };
let kit = read();
export const store = {
  get: () => (kit ? { ...kit, options: [...kit.options] } : null),
  set(k: Kit) { kit = { ...k, at: Date.now() }; try { localStorage.setItem(KEY, JSON.stringify(kit)); } catch {} document.dispatchEvent(new CustomEvent("kit:change")); },
  clear() { kit = null; try { localStorage.removeItem(KEY); } catch {} document.dispatchEvent(new CustomEvent("kit:change")); },
};

const root = document.documentElement;
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];

/* ---------- reveal ---------- */
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
export const observe = (el: ParentNode = document) => $$("[data-in]", el).forEach((n) => io.observe(n));
observe();

/* ---------- menu: the thermal cover ---------- */
const menu = document.getElementById("menu")!;
const btn = document.querySelector<HTMLButtonElement>("[data-menu]")!;
const setMenu = (o: boolean) => { root.classList.toggle("menu-open", o); btn.setAttribute("aria-expanded", String(o)); menu.setAttribute("aria-hidden", String(!o)); };
btn.addEventListener("click", () => setMenu(true));
document.querySelector("[data-menu-close]")!.addEventListener("click", () => setMenu(false));
$$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

/* ---------- the evening: the water warms from 4 to 39 °C; sections marked data-sky set day, dusk or night ---------- */
const bar = document.querySelector<HTMLElement>("[data-temp-bar]")!;
const temp = document.querySelector<HTMLElement>("[data-temp]")!;
const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
const skies = $$("[data-sky]");
const tones: Record<string, string> = { day: "#f3f5f6", dusk: "#1f3442", night: "#0b1620" };
let tick = false, sky = "";
const frame = () => {
  tick = false;
  const max = root.scrollHeight - innerHeight, p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  const t = 4 + 35 * p;
  temp.textContent = `${t.toFixed(1).replace(".", ",")} °C`;
  bar.style.transform = `scaleX(${p.toFixed(3)})`;
  // the last marked section whose top has passed the middle of the screen sets the sky
  let s = "day";
  for (const el of skies) if (el.getBoundingClientRect().top < innerHeight * 0.55) s = el.dataset.sky!;
  if (s !== sky) { sky = s; root.dataset.sky = s; meta?.setAttribute("content", tones[s]); }
};
addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
addEventListener("resize", frame);
frame();

/* ---------- the tub icon in the header steams once a tub is chosen ---------- */
const sync = () => $$("[data-cnt]").forEach((c) => c.classList.toggle("on", !!store.get()));
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

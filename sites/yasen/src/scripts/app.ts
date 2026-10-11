const root = document.documentElement;
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];

/* reveal */
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
$$("[data-in]").forEach((n) => io.observe(n));

/* menu */
const menu = document.getElementById("menu")!;
const btn = document.querySelector<HTMLButtonElement>("[data-menu]")!;
const setMenu = (o: boolean) => { root.classList.toggle("menu-open", o); btn.setAttribute("aria-expanded", String(o)); menu.setAttribute("aria-hidden", String(!o)); };
btn.addEventListener("click", () => setMenu(true));
$$("[data-menu-close]").forEach((b) => b.addEventListener("click", () => setMenu(false)));
$$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

/* the stringer: its stroke is drawn up to how far you have climbed */
const fill = document.querySelector<SVGPathElement>("[data-climb]")!;
fill.style.strokeDasharray = "1";
const hdr = document.querySelector<HTMLElement>("[data-hdr]")!;
let tick = false;
const frame = () => {
  tick = false;
  const max = root.scrollHeight - innerHeight, p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  fill.style.strokeDashoffset = String(1 - p);
  hdr.classList.toggle("solid", scrollY > 10);
};
addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
frame();

const note = document.querySelector<HTMLElement>("[data-note]")!;
let noteT = 0;
export function noted(t: string, s: string) {
  note.querySelector("[data-note-t]")!.textContent = t;
  note.querySelector("[data-note-s]")!.textContent = s;
  note.classList.remove("on"); void note.offsetWidth; note.classList.add("on");
  clearTimeout(noteT); noteT = window.setTimeout(() => note.classList.remove("on"), 4200);
}

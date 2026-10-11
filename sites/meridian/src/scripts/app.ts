const root = document.documentElement;
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];

const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
$$("[data-in]").forEach((n) => io.observe(n));

/* the log end in the header: a ring per twelfth of the page; header turns solid off the hero */
const rings = $$<SVGCircleElement>("[data-ring]");
const hdr = document.querySelector<HTMLElement>("[data-hdr]")!;
let tick = false;
const frame = () => {
  tick = false;
  const max = root.scrollHeight - innerHeight, p = max > 0 ? scrollY / max : 0;
  const n = Math.round(p * rings.length);
  rings.forEach((r) => r.classList.toggle("on", +r.dataset.ring! < n));
  hdr.classList.toggle("solid", scrollY > innerHeight * 0.6);
};
addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(frame); } }, { passive: true });
frame();

const note = document.querySelector<HTMLElement>("[data-note]")!;
let noteT = 0;
export function noted(t: string, s: string) {
  note.querySelector("[data-note-t]")!.textContent = t;
  note.querySelector("[data-note-s]")!.textContent = s;
  note.classList.remove("on"); void note.offsetWidth; note.classList.add("on");
  clearTimeout(noteT); noteT = window.setTimeout(() => note.classList.remove("on"), 4000);
}

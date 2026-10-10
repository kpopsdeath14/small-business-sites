// Rising embers on a canvas. Each canvas[data-embers] runs only while it is on screen.
// data-embers="12" sets density (sparks per 100k px²); data-from="bottom|point" picks the source.
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

type Spark = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number; tw: number };

export function mountEmbers(cv: HTMLCanvasElement) {
  if (reduced) return;
  const ctx = cv.getContext("2d")!;
  const dpr = Math.min(2, devicePixelRatio || 1);
  let w = 0, h = 0, raf = 0, on = false, last = 0;
  const sparks: Spark[] = [];
  const density = Number(cv.dataset.embers || 10);
  const resize = () => {
    const r = cv.getBoundingClientRect();
    w = r.width; h = r.height;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const spawn = () => {
    const fx = Number(cv.dataset.x ?? 0.5), spread = Number(cv.dataset.spread ?? 1);
    const x = w * (fx + (Math.random() - 0.5) * spread);
    sparks.push({ x, y: h * Number(cv.dataset.y ?? 1) + 4, vx: (Math.random() - 0.5) * 0.25, vy: -(0.35 + Math.random() * 0.75), r: 0.6 + Math.random() * 1.6, life: 0, max: 160 + Math.random() * 220, tw: Math.random() * 6 });
  };
  const frame = (t: number) => {
    if (!on) return;
    const dt = Math.min(2.5, (t - (last || t)) / 16.7); last = t;
    const target = Math.max(4, Math.round((w * h) / 100000 * density));
    if (sparks.length < target && Math.random() < 0.35 * dt) spawn();
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.life += dt; s.tw += 0.08 * dt;
      s.vx += Math.sin(s.tw) * 0.012 * dt;
      s.x += s.vx * dt; s.y += s.vy * dt;
      const k = s.life / s.max;
      if (k >= 1 || s.y < -10) { sparks.splice(i, 1); continue; }
      const a = (k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85) * (0.6 + 0.4 * Math.sin(s.tw * 3));
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
      g.addColorStop(0, `rgba(255,226,160,${a})`);
      g.addColorStop(0.35, `rgba(255,150,60,${a * 0.6})`);
      g.addColorStop(1, "rgba(255,110,30,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 4, 0, 7); ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  };
  new IntersectionObserver(([e]) => {
    on = e.isIntersecting;
    cancelAnimationFrame(raf);
    if (on) { resize(); last = 0; raf = requestAnimationFrame(frame); }
  }).observe(cv);
  addEventListener("resize", () => on && resize());
}

document.querySelectorAll<HTMLCanvasElement>("canvas[data-embers]").forEach(mountEmbers);

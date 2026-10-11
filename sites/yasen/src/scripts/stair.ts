// A wooden staircase from the floor-to-floor height: number of risers, rise and going by the step
// formula (2h + b ≈ 600–650 mm), the parts list priced by Yasen's own list, and an elevation drawing.
import { step, price } from "../lib/site";

export type Kind = "straight" | "l-landing" | "l-winder" | "u-landing";
export type Input = { H: number; kind: Kind; W: number; T: 40 | 50; paint: boolean; bal: string; risers: boolean };
export const GOING = 270; // a 300 mm tread with a 30 mm nosing

export function plan(i: Input) {
  // pick the riser count whose rise lands closest to a comfortable 175 mm
  let n = Math.max(2, Math.round(i.H / 175));
  const h = i.H / n;
  const treads = n - 1; // the top floor is the last "step"
  let f1 = treads, f2 = 0, winders = 0, landing = 0;
  if (i.kind === "l-landing" || i.kind === "u-landing") { f1 = Math.floor((treads - 1) / 2); f2 = treads - 1 - f1; landing = 1; }
  if (i.kind === "l-winder") { winders = 3; f1 = Math.floor((treads - 3) / 2); f2 = treads - 3 - f1; }
  const g = GOING;
  const flights = [f1, f2].filter((x) => x > 0);
  const slope = (k: number) => Math.hypot(k * g, k * h) / 1000; // m along the pitch
  const W = i.W / 1000;
  // footprint
  const run1 = (f1 * g) / 1000, run2 = (f2 * g) / 1000;
  const foot =
    i.kind === "straight" ? { a: run1, b: W } :
    i.kind === "u-landing" ? { a: Math.max(run1, run2) + W, b: 2 * W } :
    { a: run1 + W, b: run2 + W };
  const comfort = 2 * h + g;
  const angle = (Math.atan(h / g) * 180) / Math.PI;

  // parts
  const k = i.paint ? 1 : 0;
  const stepP = step[i.T][i.W][k];
  const lines: { name: string; qty: number; unit: string; price: number }[] = [];
  const add = (name: string, qty: number, unit: string, p: number) => { if (qty > 0) lines.push({ name, qty: Math.round(qty * 100) / 100, unit, price: Math.round(qty * p) }); };
  add(`Ступень клеёная ${i.W}×300×${i.T}`, f1 + f2, "шт", stepP);
  if (winders) add(`Ступени забежные, ${i.T} мм`, W * W, "м²", price.winder[i.T][k]);
  if (landing) add(`Площадка ${i.kind === "u-landing" ? `${i.W * 2}×${i.W}` : `${i.W}×${i.W}`}`, i.kind === "u-landing" ? 2 * W * W : W * W, "м²", price.landing[i.T][k]);
  const pitch = flights.reduce((s, f) => s + slope(f), 0);
  add("Тетива клеёная 320×60, две стороны", 2 * pitch + (winders ? 2 * W : 0), "пог. м", price.stringer[k]);
  const edge = landing ? (i.kind === "u-landing" ? W : W) : winders ? W : 0;
  add("Поручень клеёный 65×80", pitch + edge, "пог. м", price.handrail[k]);
  const bal = 2 * (f1 + f2 + winders) + Math.ceil((edge * 1000) / 150);
  add(`Балясина ${i.bal === "b55" ? "55×55" : i.bal === "b60" ? "60×60" : "50×50"}`, bal, "шт", price.baluster[i.bal][k]);
  const posts = i.kind === "straight" ? 2 : i.kind === "u-landing" ? 4 : 3;
  add("Столб точёный 90×90 с шаром", posts, "шт", price.post[k] + price.ball[k]);
  if (i.risers) add("Подступёнок 160×18", (n - 1) * W, "пог. м", price.riser[k]);
  const total = lines.reduce((s, l) => s + l.price, 0);
  return { n, h, g, treads, f1, f2, winders, landing, foot, comfort, angle, lines, total, posts };
}

/** Elevation of the flight, unfolded if it turns, with a 1.8 m figure for scale. */
export function elevationSVG(i: Input, p: ReturnType<typeof plan>) {
  const RAIL = 900, STR = 300, pad = 260, N0 = 200; // handrail height, stringer depth, margins, nosing overhang
  const L = (p.f1 + p.f2 + p.winders) * p.g + (p.landing ? i.W : 0);
  const TOPM = 1150; // room above the upper floor for the handrail and the top post
  const x0 = pad + 700, y0 = pad + TOPM + i.H; // foot of the stair on the lower floor
  const vw = x0 + L + 900, vh = i.H + pad * 2 + TOPM;
  // walk the stair: every tread (or the landing) gets its x range and its top surface level
  type Seg = { kind: "s" | "w" | "l"; xa: number; xb: number; y: number; idx: number };
  const seq: ("s" | "w" | "l")[] = [];
  for (let k = 0; k < p.f1; k++) seq.push("s");
  if (p.landing) seq.push("l");
  for (let k = 0; k < p.winders; k++) seq.push("w");
  for (let k = 0; k < p.f2; k++) seq.push("s");
  const segs: Seg[] = [];
  let x = x0, y = y0;
  seq.forEach((k, idx) => { y -= p.h; const run = k === "l" ? i.W : p.g; segs.push({ kind: k, xa: x, xb: x + run, y, idx }); x += run; });
  const xTop = x, yTop = y - p.h; // nosing of the upper floor
  // flights: runs of treads between the landing; each flight's pitch line passes through its nosings
  const flights: Seg[][] = [];
  let cur: Seg[] = [];
  segs.forEach((sg) => { if (sg.kind === "l") { if (cur.length) flights.push(cur); cur = []; } else cur.push(sg); });
  if (cur.length) flights.push(cur);
  const landing = segs.find((sg) => sg.kind === "l");
  // pitch line through nosings (xa, y) of a flight, extended by one going at the top end
  const pitch = (f: Seg[]) => { const a = f[0], z = f[f.length - 1]; return { xa: a.xa, ya: a.y, xb: z.xb, yb: z.y - p.h }; };
  const railY = (xx: number) => {
    if (landing && xx >= landing.xa && xx <= landing.xb) return landing.y - RAIL;
    for (const f of flights) { const pl = pitch(f); if (xx >= pl.xa - 1 && xx <= pl.xb + 1) return pl.ya + ((pl.yb - pl.ya) * (xx - pl.xa)) / (pl.xb - pl.xa) - RAIL; }
    return yTop - RAIL;
  };
  let treads = "", risers = "", bal = "", strs = "", rails = "", posts = "";
  segs.forEach((sg) => {
    const cls = sg.kind === "w" ? " el__tread--w" : sg.kind === "l" ? " el__tread--l" : "";
    treads += `<rect class="el__tread${cls}" style="--i:${sg.idx}" x="${sg.xa - 30}" y="${sg.y}" width="${sg.xb - sg.xa + 30}" height="${i.T}" />`;
    if (i.risers && sg.kind !== "l") risers += `<rect class="el__riser" style="--i:${sg.idx}" x="${sg.xa}" y="${sg.y + i.T}" width="18" height="${p.h - i.T}" />`;
    const nb = sg.kind === "l" ? Math.max(2, Math.round((sg.xb - sg.xa) / 150)) : 2;
    for (let k = 0; k < nb; k++) {
      const bx = sg.xa + ((sg.xb - sg.xa) / nb) * (k + 0.5);
      if (sg.kind === "l" && (bx - sg.xa < 80 || sg.xb - bx < 80)) continue; // the posts stand there
      bal += `<path class="el__bal" style="--i:${sg.idx}" d="M${bx.toFixed(0)} ${sg.y}V${railY(bx).toFixed(0)}" />`;
    }
  });
  // stringers: a glued board under each flight, parallel to its pitch, cut level at the floor
  flights.forEach((f, k) => {
    const pl = pitch(f), dy = (pl.yb - pl.ya) / (pl.xb - pl.xa);
    const at = (xx: number) => pl.ya + dy * (xx - pl.xa);
    const xs = pl.xa - 60, xe = pl.xb;
    const top1 = at(xs) + i.T + 20, top2 = at(xe) + i.T + 20;
    const bot1 = Math.min(top1 + STR / Math.cos(Math.atan(-dy)), k === 0 ? y0 : top1 + 400), bot2 = top2 + STR / Math.cos(Math.atan(-dy));
    strs += `<path class="el__str" d="M${xs} ${top1}L${xe} ${top2}L${xe} ${bot2}L${xs + (k === 0 ? (bot1 - top1) / -dy : 0)} ${bot1}Z" />`;
    // the handrail along the flight
    rails += `<path class="el__rail" d="M${pl.xa} ${(pl.ya - RAIL).toFixed(0)}L${pl.xb} ${(pl.yb - RAIL).toFixed(0)}" />`;
  });
  if (landing) {
    rails += `<path class="el__rail" d="M${landing.xa} ${landing.y - RAIL}H${landing.xb}" />`;
    strs += `<rect class="el__str" x="${landing.xa}" y="${landing.y + i.T}" width="${landing.xb - landing.xa}" height="${STR - 60}" />`;
  }
  // posts: at the foot, at both corners of the landing and at the top
  const post = (px: number, base: number, top: number) => `<rect class="el__post" x="${px - 45}" y="${top - 60}" width="90" height="${base - top + 60}" /><circle class="el__ballk" cx="${px}" cy="${top - 110}" r="50" />`;
  posts += post(x0, y0, railY(x0 + 1));
  if (landing) { posts += post(landing.xa, landing.y, landing.y - RAIL); posts += post(landing.xb, landing.y, landing.y - RAIL); }
  posts += post(xTop, yTop, yTop - RAIL);
  // the upper floor: a slab whose top is the last step
  const slab = `<path class="el__slab" d="M${xTop} ${yTop}H${vw - 60}V${yTop + 220}H${xTop}Z" />`;
  const floor = `<path class="el__floor" d="M60 ${y0}H${vw - 60}" />`;
  const man = `<g class="el__man" transform="translate(${x0 - 420} ${y0}) scale(${1800 / 172})"><circle cx="0" cy="-160" r="11" /><path d="M-12 -146h24l4 66h-8l-4 80h-8l-4-62-4 62h-8l-4-80h-8z" /></g>`;
  const dims = `<g class="el__dim"><path d="M140 ${y0}V${yTop}M100 ${y0}h80M100 ${yTop}h80" /><text x="80" y="${(y0 + yTop) / 2}" transform="rotate(-90 80 ${(y0 + yTop) / 2})">${i.H} мм</text><path d="M${x0} ${y0 + 140}H${xTop}M${x0} ${y0 + 100}v80M${xTop} ${y0 + 100}v80" /><text x="${(x0 + xTop) / 2}" y="${y0 + 240}">${Math.round(L)} мм${p.landing || p.winders ? " · развёртка" : ""}</text></g>`;
  void N0;
  return `<svg class="el" viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Лестница сбоку: ${p.n} подъёмов по ${Math.round(p.h)} мм">
    ${floor}${slab}${strs}${risers}${treads}${bal}${rails}${posts}${man}${dims}
  </svg>`;
}

export const elCSS = `
.el { width: 100%; height: 100%; overflow: visible; font-family: var(--mono); }
.el__floor { stroke: #191917; stroke-width: 10; }
.el__slab { fill: #e7e4dc; stroke: #191917; stroke-width: 8; }
.el__str { fill: color-mix(in oklab, var(--wood, #d8b98a), #000 10%); opacity: .55; }
.el__tread { fill: var(--wood, #d8b98a); stroke: #8a6a45; stroke-width: 6; animation: tr .45s cubic-bezier(.22,.9,.3,1) both; animation-delay: calc(var(--i) * .035s); }
.el__tread--w { fill: color-mix(in oklab, var(--wood, #d8b98a), #fff 25%); }
.el__tread--l { fill: color-mix(in oklab, var(--wood, #d8b98a), #000 8%); }
@keyframes tr { from { opacity: 0; transform: translateY(-60px); } }
.el__riser { fill: color-mix(in oklab, var(--wood, #d8b98a), #fff 40%); }
.el__bal { stroke: var(--bal, #b48a5a); stroke-width: 34; opacity: .95; }
.el__post { fill: var(--bal, #b48a5a); stroke: #6b4a2b; stroke-width: 6; }
.el__ballk { fill: var(--bal, #b48a5a); stroke: #6b4a2b; stroke-width: 6; }
.el__rail { stroke: color-mix(in oklab, var(--bal, #b48a5a), #000 25%); stroke-width: 70; stroke-linecap: round; }
.el__man { fill: #191917; opacity: .8; }
.el__dim path { stroke: #5b5a55; stroke-width: 6; fill: none; }
.el__dim text { font-size: 110px; fill: #5b5a55; text-anchor: middle; }
.built .el__tread { animation: drop .5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: calc(var(--i) * .09s); }
@keyframes drop { 0% { opacity: 0; transform: translateY(-400px); } 100% { opacity: 1; transform: none; } }
`;

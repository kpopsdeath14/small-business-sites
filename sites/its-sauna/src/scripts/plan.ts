// A sauna cabin drawn as a floor plan, in the manner of ITS's own drawings: wall panels, the glass
// door with its swing, the stove in the corner, bench tiers marked with their heights, and the
// lighting as plan symbols. Units are millimetres; the SVG scales to fit.
export type Layout = "straight" | "corner" | "three";
export type PlanView = { w: number; d: number; layout: Layout; wood: "lipa" | "abash" | "cedar"; light: string[]; steam: boolean; kw: number };
const WALL = 70, DOOR = 700, STOVE = 460;
const WOOD = { lipa: "#efdcb6", abash: "#e6cf9e", cedar: "#d9b48a" };

export function planSVG(v: PlanView) {
  const pad = 260, W = v.w, D = v.d;
  const vw = W + pad * 1.3, vh = D + pad + DOOR + 80;
  const ox = pad, oy = pad; // outer top-left corner
  const ix = ox + WALL, iy = oy + WALL, iw = W - 2 * WALL, id = D - 2 * WALL;
  const fill = WOOD[v.wood];
  // benches: rectangles with a height mark, drawn back (top of the plan) to front
  const benches: { x: number; y: number; w: number; h: number; z: string }[] = [];
  const top = Math.min(600, id * 0.36), low = Math.min(500, id * 0.28);
  if (v.layout === "straight") {
    benches.push({ x: ix, y: iy, w: iw, h: top, z: "0,90" }, { x: ix, y: iy + top, w: iw - STOVE - 60, h: low, z: "0,45" });
  } else if (v.layout === "corner") {
    benches.push({ x: ix, y: iy, w: iw, h: top, z: "0,90" }, { x: ix + iw - top, y: iy + top, w: top, h: Math.max(0, id - top - STOVE - 120), z: "0,90" }, { x: ix, y: iy + top, w: iw - top - 40, h: low, z: "0,45" });
  } else {
    const s = Math.min(450, id * 0.24);
    benches.push({ x: ix, y: iy, w: iw, h: s, z: "0,90" }, { x: ix, y: iy + s, w: iw, h: s, z: "0,45" }, { x: ix, y: iy + 2 * s, w: iw - STOVE - 60, h: s * 0.8, z: "0,05" });
  }
  let slats = "";
  for (const b of benches) for (let y = b.y + 70; y < b.y + b.h - 20; y += 90) slats += `M${b.x + 20} ${y}H${b.x + b.w - 20}`;
  const benchSvg = benches.map((b, i) => `<g class="pl__bench" style="--i:${i}"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${fill}" /><g class="pl__z">${b.w > 700 ? `<path d="M${b.x + b.w / 2 - 60} ${b.y + b.h / 2 - 50}h120l-60 60z" /><text x="${b.x + b.w / 2 + 80}" y="${b.y + b.h / 2 - 10}">${b.z}</text>` : `<path d="M${b.x + b.w / 2 - 60} ${b.y + b.h / 2 - 120}h120l-60 60z" /><text x="${b.x + b.w / 2}" y="${b.y + b.h / 2 + 60}" text-anchor="middle">${b.z}</text>`}</g></g>`).join("");
  // stove in the front-right corner, with its wooden guard
  const sx = ix + iw - STOVE - 30, sy = iy + id - STOVE - 30;
  const stove = `<g class="pl__stove"><rect class="pl__guard" x="${sx - 40}" y="${sy - 40}" width="${STOVE + 70}" height="${STOVE + 70}" /><rect x="${sx}" y="${sy}" width="${STOVE}" height="${STOVE}" rx="30" /><circle cx="${sx + STOVE / 2}" cy="${sy + STOVE / 2}" r="${STOVE * 0.3}" class="pl__stones" /><text x="${sx + STOVE / 2}" y="${sy + STOVE / 2 + 30}">${String(v.kw).replace(".", ",")} кВт</text>${v.steam ? `<path class="pl__steam" d="M${sx + STOVE / 2 - 60} ${sy - 70} q 30 -60 0 -120 M${sx + STOVE / 2 + 40} ${sy - 70} q 30 -60 0 -120" />` : ""}</g>`;
  // the door: bottom-left, opening outwards with a swing arc
  const dx = ix + 80, dy = oy + D;
  const door = `<g class="pl__door"><rect x="${dx}" y="${dy - WALL}" width="${DOOR}" height="${WALL}" class="pl__gap" /><path class="pl__leaf" d="M${dx} ${dy}L${dx} ${dy + DOOR}" /><path class="pl__arc" d="M${dx} ${dy + DOOR}A${DOOR} ${DOOR} 0 0 0 ${dx + DOOR} ${dy}" /></g>`;
  // lights
  const L = new Set(v.light);
  let light = "";
  if (L.has("corner")) light += [[ix + 90, iy + 90], [ix + iw - 90, iy + 90]].map(([x, y]) => `<g class="pl__lamp"><circle cx="${x}" cy="${y}" r="60" /><path d="M${x - 42} ${y - 42}L${x + 42} ${y + 42}M${x + 42} ${y - 42}L${x - 42} ${y + 42}" /></g>`).join("");
  if (L.has("under")) light += benches.filter((b) => b.z !== "0,05").map((b) => `<path class="pl__under" d="M${b.x + 30} ${b.y + b.h - 14}H${b.x + b.w - 30}" />`).join("");
  if (L.has("stars")) { let s = ""; for (let i = 0; i < 21; i++) { const x = ix + ((i * 263) % 1000) / 1000 * iw, y = iy + ((i * 571) % 1000) / 1000 * id * 0.9; s += `<circle class="pl__star" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="16" style="--i:${i}" />`; } light += s; }
  if (L.has("salt")) light += `<rect class="pl__salt" x="${ix + iw * 0.3}" y="${iy - 8}" width="${iw * 0.4}" height="34" />`;
  // dimension lines: width on top, depth on the left
  const dim = `<g class="pl__dim"><path d="M${ox} ${oy - 120}H${ox + W}M${ox} ${oy - 150}v60M${ox + W} ${oy - 150}v60" /><text x="${ox + W / 2}" y="${oy - 150}">${W}</text><path d="M${ox - 120} ${oy}V${oy + D}M${ox - 150} ${oy}h60M${ox - 150} ${oy + D}h60" /><text x="${ox - 150}" y="${oy + D / 2}" transform="rotate(-90 ${ox - 150} ${oy + D / 2})">${D}</text></g>`;
  // walls: linden panels, outer line plus inner line
  const walls = `<path class="pl__wall" fill-rule="evenodd" d="M${ox} ${oy}h${W}v${D}h${-W}z M${ix} ${iy}v${id}h${iw}v${-id}z" />`;
  return `<svg class="pl" viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Планировка сауны ${W} на ${D} мм">
    <rect class="pl__floor" x="${ix}" y="${iy}" width="${iw}" height="${id}" />
    ${benchSvg}<path class="pl__slats" d="${slats}" />${stove}${light}${walls}${door}${dim}
  </svg>`;
}

export const planCSS = `
.pl { width: 100%; height: 100%; overflow: visible; font-family: var(--mono); }
.pl__floor { fill: #fbf6ec; }
.pl__wall { fill: #c9955a; stroke: #6b4a2b; stroke-width: 6; }
.pl__bench rect { stroke: #8a6a45; stroke-width: 6; animation: bench .6s cubic-bezier(.22,.9,.3,1) both; animation-delay: calc(var(--i) * .08s); transform-box: fill-box; transform-origin: top; }
@keyframes bench { from { transform: scaleY(0); opacity: 0; } }
.pl__slats { stroke: rgba(107, 74, 43, .25); stroke-width: 6; }
.pl__z path { fill: #241a14; } .pl__z text { font-size: 110px; fill: #241a14; }
.pl__guard { fill: none; stroke: #8a6a45; stroke-width: 8; stroke-dasharray: 30 20; }
.pl__stove rect:not(.pl__guard) { fill: #3a3633; }
.pl__stones { fill: #6b6560; }
.pl__stove text { font-size: 90px; fill: #fbf6ec; text-anchor: middle; }
.pl__steam { fill: none; stroke: #8d7b6c; stroke-width: 14; stroke-linecap: round; opacity: .6; animation: st 2.4s ease-in-out infinite alternate; }
@keyframes st { to { transform: translateY(-30px); opacity: .2; } }
.pl__gap { fill: #fbf6ec; }
.pl__leaf { stroke: #6b4a2b; stroke-width: 16; }
.pl__arc { fill: none; stroke: #6b4a2b; stroke-width: 5; stroke-dasharray: 24 18; }
.pl__lamp circle { fill: #fff3d6; stroke: #d9682c; stroke-width: 8; } .pl__lamp path { stroke: #d9682c; stroke-width: 8; }
.pl__under { stroke: #f0904f; stroke-width: 22; stroke-linecap: round; filter: drop-shadow(0 0 30px #f0904f); }
.pl__star { fill: #f6d58b; animation: tw 2.6s ease-in-out infinite alternate; animation-delay: calc(var(--i) * -.37s); }
@keyframes tw { to { opacity: .25; } }
.pl__salt { fill: #f0a77a; filter: drop-shadow(0 0 40px #f0904f); }
.pl__dim path { stroke: #5f4e42; stroke-width: 5; fill: none; }
.pl__dim text { font-size: 100px; fill: #5f4e42; text-anchor: middle; }
`;

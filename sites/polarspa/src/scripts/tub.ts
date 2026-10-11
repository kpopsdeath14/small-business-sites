// A hot tub seen from above, drawn to scale: wooden rim, composite bowl, water, seats, the stove,
// and whatever options are switched on. 1 unit = 1 cm. Everything is our own drawing, never on a photo.
export type Shape = "round" | "square" | "corner" | "rect";
export type View = {
  shape: Shape; w: number; l: number; seats: number;
  wood?: "light" | "dark" | "graphite"; bowl?: string; heat?: "stove" | "cold" | "spa" | "bath";
  led?: boolean; aero?: boolean; cover?: boolean; tent?: boolean; warm?: boolean; ladder?: boolean; shelf?: boolean; steam?: boolean; ice?: boolean; people?: boolean;
  id?: string;
};
const WOOD = { light: ["#cf9a62", "#a8743f"], dark: ["#6e4329", "#4d2d1a"], graphite: ["#46484b", "#2c2d2f"] };

/** outline of the bowl, inset by `k` cm from the outer edge */
function outline(v: View, k: number, cx: number, cy: number) {
  const W = v.w - 2 * k, L = v.l - 2 * k;
  if (v.shape === "round") return `<ellipse cx="${cx}" cy="${cy}" rx="${W / 2}" ry="${L / 2}"`;
  if (v.shape === "square") { const rr = Math.min(W, L) * 0.16; return `<rect x="${cx - W / 2}" y="${cy - L / 2}" width="${W}" height="${L}" rx="${rr}"`; }
  if (v.shape === "rect") { const rr = Math.min(W, L) * 0.12; return `<rect x="${cx - W / 2}" y="${cy - L / 2}" width="${W}" height="${L}" rx="${rr}"`; }
  // corner: a quarter disc, corner at the top left
  const x0 = cx - W / 2, y0 = cy - L / 2;
  return `<path d="M${x0} ${y0} H${x0 + W * 0.55} A${W * 0.45} ${L * 0.45} 0 0 1 ${x0 + W} ${y0 + L * 0.45} V${y0 + L} H${x0} Z"`;
}

export function tubSVG(v: View, opts: { pad?: number; label?: boolean } = {}) {
  const id = v.id ?? "t";
  const pad = opts.pad ?? 30;
  const rim = v.shape === "rect" ? 10 : 14; // wooden cladding thickness
  const W = v.w, L = v.l;
  const stove = v.heat === "stove";
  const extra = stove ? 70 : 0; // the stove sits beside the round/square tubs
  const vw = W + 2 * pad + extra + (v.ladder ? 50 : 0), vh = L + 2 * pad;
  const cx = pad + (v.ladder ? 50 : 0) + W / 2, cy = pad + L / 2;
  const [w1, w2] = WOOD[v.wood ?? "light"];
  // staves of the cladding: radial lines on round tubs, parallel boards otherwise
  let staves = "";
  if (v.shape === "round") for (let a = 0; a < 360; a += 7.5) { const t = (a * Math.PI) / 180; staves += `M${cx + Math.cos(t) * (W / 2 - rim)} ${cy + Math.sin(t) * (L / 2 - rim)}L${cx + Math.cos(t) * (W / 2)} ${cy + Math.sin(t) * (L / 2)}`; }
  else for (let x = -W / 2; x <= W / 2; x += 9) staves += `M${cx + x} ${cy - L / 2}V${cy + L / 2}`;
  // seats: little steps inside the bowl, spread round the edge
  let seats = "";
  const n = Math.max(1, v.seats);
  if (v.people) for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const rx = (W / 2 - rim - 22) * (v.shape === "rect" ? 0.2 : 1), ry = (L / 2 - rim - 22) * (v.shape === "rect" ? 0.6 : 1);
    const px = cx + Math.cos(a) * rx, py = cy + Math.sin(a) * ry;
    seats += `<g class="tv__p" style="--i:${i}"><circle cx="${px}" cy="${py}" r="10" /><ellipse cx="${px - Math.cos(a) * 9}" cy="${py - Math.sin(a) * 9}" rx="13" ry="7" transform="rotate(${(a * 180) / Math.PI + 90} ${px - Math.cos(a) * 9} ${py - Math.sin(a) * 9})" /></g>`;
  }
  // bubbles for air massage: rising rings on fixed spots
  let bubbles = "";
  if (v.aero) for (let i = 0; i < 26; i++) {
    const a = i * 2.4, rr = ((i * 37) % 100) / 100;
    const bx = cx + Math.cos(a) * (W / 2 - rim - 10) * rr, by = cy + Math.sin(a) * (L / 2 - rim - 10) * rr;
    bubbles += `<circle class="tv__b" cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${2 + (i % 3)}" style="--i:${i}" />`;
  }
  // steam: soft wisps drifting off a hot surface
  let steam = "";
  if (v.steam) for (let i = 0; i < 5; i++) steam += `<path class="tv__s" style="--i:${i}" d="M${cx - W / 4 + (i * W) / 8} ${cy + L / 6} q 12 -20 0 -40 q -12 -20 0 -40" />`;
  // ice plates on cold water
  let ice = "";
  if (v.ice) for (let i = 0; i < 7; i++) { const a = i * 0.9, rr = 0.15 + ((i * 29) % 60) / 100; const ix = cx + Math.cos(a) * (W / 2 - rim) * rr * 0.8, iy = cy + Math.sin(a) * (L / 2 - rim) * rr * 0.8; ice += `<path class="tv__i" style="--i:${i}" d="M${ix} ${iy} l14 -6 l12 8 l-4 12 l-16 2 z" />`; }
  const stoveG = stove ? `<g class="tv__stove"><rect x="${cx + W / 2 + 8}" y="${cy - 28}" width="46" height="56" rx="6" /><circle cx="${cx + W / 2 + 31}" cy="${cy}" r="10" class="tv__chim" /><path d="M${cx + W / 2 - rim} ${cy - 10} H${cx + W / 2 + 8} M${cx + W / 2 - rim} ${cy + 10} H${cx + W / 2 + 8}" class="tv__pipe" /></g>` : "";
  const ladder = v.ladder ? `<g class="tv__lad"><rect x="${cx - W / 2 - 46}" y="${cy - 26}" width="40" height="52" rx="3" /><path d="M${cx - W / 2 - 46} ${cy - 9}H${cx - W / 2 - 6}M${cx - W / 2 - 46} ${cy + 8}H${cx - W / 2 - 6}" /></g>` : "";
  const shelf = v.shelf ? `<rect class="tv__shelf" x="${cx - 22}" y="${cy - L / 2 - 4}" width="44" height="14" rx="2" />` : "";
  return `<svg class="tv${v.led ? " tv--led" : ""}${v.cover ? " tv--cover" : ""}${v.tent ? " tv--tent" : ""}" viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Купель, вид сверху, ${W} × ${L} см">
    <defs>
      <radialGradient id="wtr${id}" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="#7cc8d2" /><stop offset=".6" stop-color="#2f8c9c" /><stop offset="1" stop-color="#1c5f6c" /></radialGradient>
      <radialGradient id="led${id}" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="var(--led, #6fe0f0)" stop-opacity=".95" /><stop offset="1" stop-color="var(--led, #6fe0f0)" stop-opacity="0" /></radialGradient>
      <clipPath id="rim${id}">${outline(v, 0, cx, cy)} /></clipPath>
      <clipPath id="tent${id}">${outline(v, -3, cx, cy)} /></clipPath>
      <clipPath id="bowl${id}">${outline(v, rim + 9, cx, cy)} /></clipPath>
    </defs>
    ${ladder}${stoveG}
    ${outline(v, 0, cx, cy)} fill="${w1}" stroke="${w2}" stroke-width="2" class="tv__rim" />
    <path d="${staves}" stroke="${w2}" stroke-width="1" opacity=".55" clip-path="url(#rim${id})" />
    ${outline(v, rim, cx, cy)} fill="${v.bowl ?? "#e9eef0"}" class="tv__bowl" />${v.warm ? `${outline(v, rim - 3, cx, cy)} class="tv__warm" />` : ""}
    <g clip-path="url(#bowl${id})">
      ${outline(v, rim + 9, cx, cy)} fill="url(#wtr${id})" class="tv__water" />
      <rect class="tv__glow" x="0" y="0" width="${vw}" height="${vh}" fill="url(#led${id})" />
      <g class="tv__caus"><path d="M${cx - W / 2} ${cy - L / 5} q ${W / 4} -14 ${W / 2} 0 t ${W / 2} 0 M${cx - W / 2} ${cy + L / 8} q ${W / 4} 12 ${W / 2} 0 t ${W / 2} 0" /></g>
      ${bubbles}${ice}${seats}
    </g>
    ${steam}${shelf}
    <g class="tv__tent">${outline(v, -3, cx, cy)} class="tv__tentshape" /><path class="tv__strap" clip-path="url(#tent${id})" d="M${cx - W / 2 - 3} ${cy - L / 4} H${cx + W / 2 + 3} M${cx - W / 2 - 3} ${cy + L / 4} H${cx + W / 2 + 3}" /></g>
    <g class="tv__lid">${outline(v, rim - 2, cx, cy)} class="tv__lidshape" /><path class="tv__fold" d="M${cx} ${cy - L / 2 + rim} V${cy + L / 2 - rim}" /></g>
    ${opts.label ? `<text class="tv__dim" x="${cx}" y="${vh - 6}" text-anchor="middle">${v.shape === "round" ? `Ø ${W}` : `${W} × ${L}`} см</text>` : ""}
  </svg>`;
}

/** Shared styles for every tub drawing (inserted once by the page that uses them). */
export const tubCSS = `
.tv { width: 100%; height: 100%; overflow: visible; }
.tv__bowl { stroke: rgba(0,0,0,.08); }
.tv__water { transition: fill .6s; }
.tv__glow { opacity: 0; transition: opacity .8s; mix-blend-mode: screen; }
.tv--led .tv__glow { opacity: .9; animation: chroma 9s linear infinite; }
@keyframes chroma { 0% { --led: #6fe0f0; filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
.tv__caus path { fill: none; stroke: rgba(255,255,255,.35); stroke-width: 2; stroke-linecap: round; animation: caus 4s ease-in-out infinite alternate; }
@keyframes caus { to { transform: translate(6px, 4px); } }
.tv__b { fill: none; stroke: rgba(255,255,255,.85); stroke-width: 1.2; animation: bub 1.6s ease-in infinite; animation-delay: calc(var(--i) * -.13s); transform-box: fill-box; transform-origin: center; }
@keyframes bub { 0% { transform: scale(.3); opacity: 0; } 30% { opacity: 1; } 100% { transform: scale(1.8); opacity: 0; } }
.tv__s { fill: none; stroke: rgba(255,255,255,.75); stroke-width: 5; stroke-linecap: round; filter: blur(3px); opacity: 0; animation: steam 4.5s ease-out infinite; animation-delay: calc(var(--i) * .8s); }
@keyframes steam { 0% { opacity: 0; transform: translateY(10px); } 30% { opacity: .8; } 100% { opacity: 0; transform: translateY(-40px) translateX(8px); } }
.tv__i { fill: rgba(240,248,252,.92); stroke: rgba(160,200,215,.8); stroke-width: 1; }
.tv__p circle { fill: #e8c2a0; } .tv__p ellipse { fill: #5f6f78; }
.tv__stove rect { fill: #2a2f33; } .tv__chim { fill: #111; stroke: #555; } .tv__pipe { stroke: #3a4044; stroke-width: 6; }
.tv__lad rect { fill: #c99563; stroke: #a07040; } .tv__lad path { stroke: #a07040; stroke-width: 3; }
.tv__shelf { fill: #c99563; stroke: #a07040; }
.tv__lidshape { fill: #3d4a52; stroke: #2a343a; stroke-width: 2; }
.tv__fold { stroke: #26313a; stroke-width: 2; }
.tv__lid { transform: translateX(-120%); opacity: 0; transition: transform .9s cubic-bezier(.22,.9,.3,1), opacity .5s; }
.tv--cover .tv__lid { transform: none; opacity: 1; }
.tv__warm { fill: none; stroke: #e7c27a; stroke-width: 3; stroke-dasharray: 2 5; opacity: .9; }
.tv__tent { opacity: 0; transform: translateY(-14%) scale(1.04); transform-origin: center; transform-box: fill-box; transition: transform .8s cubic-bezier(.22,.9,.3,1), opacity .5s; }
.tv--tent .tv__tent { opacity: 1; transform: none; }
.tv--tent.tv--cover .tv__tent { opacity: 0; }
.tv__tentshape { fill: rgba(70,86,96,.86); stroke: #2f3c44; stroke-width: 2; }
.tv__strap { stroke: #1d262c; stroke-width: 4; stroke-dasharray: 10 6; }
.tv__dim { font-family: var(--mono); font-size: 13px; fill: currentColor; }
`;

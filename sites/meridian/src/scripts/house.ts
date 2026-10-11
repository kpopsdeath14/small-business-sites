// A glued-beam house in elevation, drawn course by course (each «венец» is one beam row), with
// windows, a door, a gable roof, a chimney and, optionally, a terrace. Units: centimetres.
export type HouseView = { w: number; floors: 1 | 2; terrace?: boolean; flag?: boolean; id?: string };
const COURSE = 18; // a 180 mm beam, as they make them

export function houseSVG(v: HouseView) {
  const W = v.w * 100, storey = 300, walls = v.floors === 2 ? storey * 1.75 : storey; // the attic floor sits partly under the roof
  const pad = 120, ground = 60;
  const roofH = Math.min(W * 0.42, 520);
  const vw = W + pad * 2 + (v.terrace ? 260 : 0), vh = walls + roofH + ground + pad + 140;
  const x0 = pad, y0 = vh - ground; // bottom-left of the walls
  const n = Math.round(walls / COURSE);
  let courses = "";
  for (let i = 0; i < n; i++) {
    const y = y0 - (i + 1) * COURSE;
    // log ends stick out a little at the corners, like a real «чаша» joint
    courses += `<rect class="hs__c" style="--i:${i}" x="${x0 - 14}" y="${y}" width="${W + 28}" height="${COURSE - 1}" rx="7" />`;
  }
  // windows and a door, cut through the courses after they are laid
  const wins: string[] = [];
  const bays = Math.max(2, Math.round(W / 260));
  for (let b = 0; b < bays; b++) {
    const cx = x0 + (W / bays) * (b + 0.5);
    if (b === Math.floor(bays / 2)) wins.push(`<rect class="hs__door" x="${cx - 50}" y="${y0 - 220}" width="100" height="220" rx="4" />`);
    else wins.push(`<rect class="hs__win" x="${cx - 60}" y="${y0 - 210}" width="120" height="140" rx="4" /><path class="hs__mull" d="M${cx} ${y0 - 210}v140M${cx - 60} ${y0 - 140}h120" />`);
    if (v.floors === 2 && Math.abs(b - (bays - 1) / 2) < bays / 2.4) wins.push(`<rect class="hs__win" x="${cx - 50}" y="${y0 - storey - 190}" width="100" height="120" rx="4" /><path class="hs__mull" d="M${cx} ${y0 - storey - 190}v120" />`);
  }
  const top = y0 - n * COURSE;
  const roof = `<path class="hs__roof" d="M${x0 - 70} ${top + 10} L${x0 + W / 2} ${top - roofH} L${x0 + W + 70} ${top + 10} Z" /><path class="hs__gable" d="M${x0 + 30} ${top} L${x0 + W / 2} ${top - roofH + 70} L${x0 + W - 30} ${top} Z" />`;
  const chx = x0 + W * 0.72;
  const chimney = `<g class="hs__ch"><rect x="${chx}" y="${top - roofH * 0.62}" width="56" height="${roofH * 0.4}" /><path class="hs__smoke" d="M${chx + 28} ${top - roofH * 0.64} q 30 -50 0 -100 q -30 -50 10 -110" /></g>`;
  const gwin = `<circle class="hs__win" cx="${x0 + W / 2}" cy="${top - roofH * 0.38}" r="${Math.min(70, roofH * 0.16)}" />`;
  const terrace = v.terrace ? `<g class="hs__ter"><rect x="${x0 + W + 14}" y="${y0 - 30}" width="240" height="30" /><path d="M${x0 + W + 30} ${y0 - 30}v-230M${x0 + W + 240} ${y0 - 30}v-230M${x0 + W + 14} ${y0 - 260}h246M${x0 + W + 30} ${y0 - 120}h210" /></g>` : "";
  // a fir sprig on the ridge: the old builders' «праздник стропил»
  const flag = v.flag ? `<g transform="translate(${x0 + W / 2} ${top - roofH})"><g class="hs__fir"><path d="M0 0 v-90" /><path d="M0 -90 l-22 34 h12 l-18 28 h14 l-16 24 h60 l-16 -24 h14 l-18 -28 h12 Z" /></g></g>` : "";
  const groundG = `<path class="hs__ground" d="M0 ${y0} H${vw}" /><rect class="hs__found" x="${x0 - 20}" y="${y0}" width="${W + 40}" height="22" />`;
  return `<svg class="hs" style="--n:${n}" viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Дом из клееного бруса, ${n} венцов">
    ${groundG}${terrace}<g class="hs__walls">${courses}</g>${wins.join("")}${chimney}${roof}${gwin}${flag}
  </svg>`;
}

export const houseCSS = `
.hs { width: 100%; height: 100%; overflow: visible; }
.hs__ground { stroke: currentColor; stroke-width: 6; opacity: .5; }
.hs__found { fill: #8a8f8a; }
.hs__c { fill: #e2b778; stroke: #b0814a; stroke-width: 2; animation: course .45s cubic-bezier(.3,1.3,.5,1) both; animation-delay: calc(var(--i) * var(--step, 45ms)); }
@keyframes course { from { opacity: 0; transform: translateY(-120px); } }
.hs__win { fill: #1d3a57; stroke: #f3f0e8; stroke-width: 8; animation: fade .4s both; animation-delay: calc(var(--n, 18) * var(--step, 45ms)); }
.hs__mull { stroke: #f3f0e8; stroke-width: 6; animation: fade .4s both; animation-delay: calc(var(--n, 18) * var(--step, 45ms)); }
.hs__door { fill: #7a4e2c; stroke: #f3f0e8; stroke-width: 8; animation: fade .4s both; animation-delay: calc(var(--n, 18) * var(--step, 45ms)); }
.hs__roof { fill: #3a3f3c; animation: roof .6s cubic-bezier(.3,1.4,.5,1) both; animation-delay: calc(var(--n, 18) * var(--step, 45ms) + .1s); }
.hs__gable { fill: #d3a466; animation: roof .6s cubic-bezier(.3,1.4,.5,1) both; animation-delay: calc(var(--n, 18) * var(--step, 45ms) + .1s); }
@keyframes roof { from { opacity: 0; transform: translateY(-200px); } }
@keyframes fade { from { opacity: 0; } }
.hs__ch rect { fill: #7d5a43; animation: fade .4s both; animation-delay: calc(var(--n, 18) * var(--step, 45ms) + .3s); }
.hs__smoke { fill: none; stroke: #c3cbbf; stroke-width: 18; stroke-linecap: round; opacity: 0; animation: smoke 3.2s ease-out infinite; animation-delay: calc(var(--n, 18) * var(--step, 45ms) + .7s); }
@keyframes smoke { 0% { opacity: 0; transform: translateY(20px); } 30% { opacity: .6; } 100% { opacity: 0; transform: translateY(-60px) translateX(20px); } }
.hs__ter rect { fill: #c9924f; } .hs__ter path { stroke: #c9924f; stroke-width: 14; fill: none; }
.hs__fir path:first-child { stroke: #7a5634; stroke-width: 6; } .hs__fir path:last-child { fill: #3f5d43; }
.hs__fir { animation: fir .7s cubic-bezier(.3,1.6,.5,1) both; animation-delay: calc(var(--n, 18) * var(--step, 45ms) + .6s); transform-box: fill-box; transform-origin: 50% 100%; }
@keyframes fir { from { opacity: 0; transform: scale(.2); } }
`;

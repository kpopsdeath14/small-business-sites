// A joiner's drawing of a door or window, generated from its parameters. Units are millimetres.
// Every part (frame, stiles, rails, panels, glass, hardware) is its own element so it can be "assembled".
export type Params = { kind: string; wood: string; w: number; h: number; leaves: number; style: string; transom: string };
export type Price = { area: number; rate: number; big: boolean; kit: number; base: number; total: number };

const KINDS: Record<string, { pine: number; oak: number; kit: number; win: boolean }> = {
  inner: { pine: 30000, oak: 46000, kit: 4500, win: false },
  entry: { pine: 48000, oak: 80000, kit: 9500, win: false },
  giop: { pine: 47500, oak: 70000, kit: 0, win: false },
  window: { pine: 25000, oak: 42000, kit: 0, win: true },
  giopwin: { pine: 21000, oak: 40000, kit: 0, win: true },
};
const WOOD_BASE: Record<string, "pine" | "oak"> = { oak: "oak", pine: "pine", dark: "oak", white: "pine" };

/** Price by the client's list: rate per m² by wood, +10% over 2200 mm high or 950 mm leaf width, hardware set per door. */
export function price(p: Params): Price {
  const k = KINDS[p.kind];
  const area = (p.w * p.h) / 1e6;
  const rate = k[WOOD_BASE[p.wood]];
  const big = p.h > 2200 || p.w / p.leaves > 950;
  const base = area * rate * (big ? 1.1 : 1);
  const kit = k.kit;
  return { area, rate, big, kit, base, total: Math.round((base + kit) / 100) * 100 };
}
export const isWindow = (kind: string) => KINDS[kind].win;

const r = (x: number, y: number, w: number, h: number, cls: string, k: number, extra = "") => `<rect class="pt ${cls}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0, w).toFixed(1)}" height="${Math.max(0, h).toFixed(1)}" style="--k:${k}" ${extra}/>`;

/** Raised panel: one piece of the same wood; the four bevels are shaded as if lit from the upper left. */
function panel(x: number, y: number, w: number, h: number, k: number) {
  const b = Math.min(48, w * 0.16, h * 0.16);
  const X = x + w, Y = y + h;
  return `<g class="pt pnl" style="--k:${k}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#wv)" class="pnl__f"/>
    <path class="sh sh--lt" d="M${x} ${y}H${X}L${X - b} ${y + b}H${x + b}V${Y - b}L${x} ${Y}Z"/>
    <path class="sh sh--dk" d="M${X} ${y}V${Y}H${x}L${x + b} ${Y - b}H${X - b}V${y + b}Z"/>
    <rect class="pnl__r" x="${x + b}" y="${y + b}" width="${w - 2 * b}" height="${h - 2 * b}" fill="none"/>
  </g>`;
}
/** Glass with glazing bars (шпросы). */
function glass(x: number, y: number, w: number, h: number, cols: number, rows: number, k: number) {
  let bars = "";
  for (let i = 1; i < cols; i++) bars += `<rect class="bar" x="${x + (w * i) / cols - 12}" y="${y}" width="24" height="${h}" fill="url(#wv)"/>`;
  for (let j = 1; j < rows; j++) bars += `<rect class="bar" x="${x}" y="${y + (h * j) / rows - 12}" width="${w}" height="24" fill="url(#wh)"/>`;
  return `<g class="pt gls" style="--k:${k}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#glass)"/><path class="refl" d="M${x + w * 0.15} ${y + h * 0.85}L${x + w * 0.55} ${y + h * 0.15}M${x + w * 0.3} ${y + h * 0.9}L${x + w * 0.7} ${y + h * 0.2}"/>${bars}</g>`;
}

export function draw(p: Params, opts: { swatch: string; dims?: boolean; id?: string } = { swatch: "" }) {
  const id = opts.id ?? "d";
  const win = isWindow(p.kind);
  const F = win ? 60 : 75; // frame (коробка) width
  const M = opts.dims === false ? 40 : 260; // room for dimension lines
  const W = p.w, H = p.h;
  const parts: string[] = [];
  // frame and transom
  const arch = p.transom === "arch";
  const tH = p.transom === "none" ? 0 : Math.round(H * (win ? 0.26 : 0.22));
  const archR = arch ? W / 2 : 0;
  const top = arch ? Math.max(tH, archR) : tH;
  if (arch) {
    // arched head: outer and inner semicircle of the frame
    const cx = W / 2, cy = archR;
    parts.push(`<path class="pt frm" style="--k:0" fill="url(#wv)" d="M0 ${H}V${cy}A${archR} ${archR} 0 0 1 ${W} ${cy}V${H}H${W - F}V${cy}A${archR - F} ${archR - F} 0 0 0 ${F} ${cy}V${H}Z"/>`);
    void cx;
  } else {
    parts.push(r(0, 0, F, H, "frm", 0, `fill="url(#wv)"`), r(W - F, 0, F, H, "frm", 0, `fill="url(#wv)"`), r(0, 0, W, F, "frm", 0, `fill="url(#wh)"`));
  }
  if (!win) parts.push(r(0, H - 20, W, 20, "frm sill", 0, `fill="url(#wh)"`));
  else parts.push(r(-40, H - F, W + 80, F, "frm", 0, `fill="url(#wh)"`));
  // transom
  if (tH) {
    const ty = arch ? top : F + tH;
    parts.push(r(F, ty, W - 2 * F, F, "rail", 1, `fill="url(#wh)"`));
    if (arch) {
      const cx = W / 2, cy = archR, rr = archR - F;
      let bars = "";
      for (let i = 1; i < 6; i++) { const a = Math.PI - (Math.PI * i) / 6; bars += `<path class="bar" d="M${cx} ${ty} L${cx + Math.cos(a) * rr} ${cy - Math.sin(a) * rr}" stroke="url(#wv)" stroke-width="22"/>`; }
      parts.push(`<g class="pt gls" style="--k:3"><path d="M${F} ${ty}V${cy}A${rr} ${rr} 0 0 1 ${W - F} ${cy}V${ty}Z" fill="url(#glass)"/>${bars}<circle cx="${cx}" cy="${ty}" r="${rr * 0.18}" fill="url(#wv)"/></g>`);
    } else parts.push(glass(F, F, W - 2 * F, tH, Math.max(2, Math.round(W / 450)), 1, 3));
  }
  // leaves
  const y0 = tH ? (arch ? top + F : F + tH + F) : F;
  const y1 = win ? H - F : H - 20;
  const n = Math.max(1, p.leaves);
  const lw = (W - 2 * F) / n;
  for (let i = 0; i < n; i++) {
    const x = F + i * lw, lh = y1 - y0;
    const s = win ? 60 : Math.min(120, lw * 0.16); // stile
    const tr = win ? 60 : 120, br = win ? 80 : 230; // top and bottom rails
    parts.push(r(x, y0, s, lh, "stile", 1, `fill="url(#wv)" data-d="${i % 2 ? 1 : -1}"`), r(x + lw - s, y0, s, lh, "stile", 1, `fill="url(#wv)" data-d="${i % 2 ? 1 : -1}"`));
    parts.push(r(x + s, y0, lw - 2 * s, tr, "rail", 2, `fill="url(#wh)"`), r(x + s, y1 - br, lw - 2 * s, br, "rail", 2, `fill="url(#wh)"`));
    const ix = x + s, iw = lw - 2 * s, iy = y0 + tr, ih = lh - tr - br;
    if (win) {
      const cols = p.style === "plain" ? 1 : 2, rows = p.style === "plain" ? 1 : p.style === "grid" ? 3 : 2;
      parts.push(glass(ix, iy, iw, ih, cols, rows, 3));
      parts.push(`<g class="pt hw" style="--k:4"><rect x="${i % 2 ? x + 18 : x + lw - 38}" y="${iy + ih * 0.5 - 70}" width="20" height="140" rx="10"/></g>`);
    } else {
      const midH = 150, midY = iy + ih * 0.6 - midH / 2;
      if (p.style === "six") {
        const ms = Math.min(90, iw * 0.18);
        parts.push(r(ix + iw / 2 - ms / 2, iy, ms, ih, "stile", 1, `fill="url(#wv)"`));
        const pw = (iw - ms) / 2, rowsY = [iy, iy + ih * 0.38, iy + ih * 0.72], rh = [ih * 0.38 - 60, ih * 0.34 - 60, ih * 0.28];
        rowsY.forEach((yy, j) => {
          if (j > 0) parts.push(r(ix, yy - 60, iw, 60, "rail", 2, `fill="url(#wh)"`));
          parts.push(panel(ix, yy, pw, rh[j], 3), panel(ix + pw + ms, yy, pw, rh[j], 3));
        });
      } else {
        parts.push(r(ix, midY, iw, midH, "rail", 2, `fill="url(#wh)"`));
        if (p.style === "glass") parts.push(glass(ix, iy, iw, midY - iy, 2, 3, 3));
        else parts.push(panel(ix, iy, iw, midY - iy, 3));
        parts.push(panel(ix, midY + midH, iw, iy + ih - midY - midH, 3));
      }
      // brass lever handle on the lock side, 1000 mm from the floor
      const lock = n === 1 ? x + lw - s / 2 : i === 0 ? x + lw - s / 2 : -1;
      if (lock > 0) {
        const hy = H - 1000;
        parts.push(`<g class="pt hw" style="--k:4"><rect x="${lock - 22}" y="${hy - 90}" width="44" height="210" rx="22"/><rect x="${lock - 150}" y="${hy - 16}" width="160" height="32" rx="16"/><circle cx="${lock}" cy="${hy + 80}" r="10" class="key"/></g>`);
      }
    }
  }
  // dimension lines
  let dims = "";
  if (opts.dims !== false) {
    const tick = (x: number, y: number) => `M${x - 22} ${y + 22}L${x + 22} ${y - 22}`;
    const by = H + 150, rx = W + 150;
    dims = `<g class="pt dim" style="--k:5">
      <path d="M0 ${H + 30}V${by + 40}M${W} ${H + 30}V${by + 40}M-40 ${by}H${W + 40}${tick(0, by)}${tick(W, by)}"/>
      <text x="${W / 2}" y="${by - 34}">${W}</text>
      <path d="M${W + 30} 0H${rx + 40}M${W + 30} ${H}H${rx + 40}M${rx} -40V${H + 40}${tick(rx, 0)}${tick(rx, H)}"/>
      <text x="${rx + 40}" y="${H / 2}" transform="rotate(-90 ${rx + 40} ${H / 2})" dy="-12">${H}</text>
      ${n > 1 ? `<text class="dim__s" x="${W / 2}" y="${by + 110}">${n} × ${Math.round(lw)}</text>` : ""}
    </g>`;
  }
  const vb = `${-M * 0.5} ${-60} ${W + M * 1.4} ${H + M + 60}`;
  return `<svg class="dr" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Чертёж: ${W} × ${H} мм">
    <defs>
      <pattern id="wv${id}" patternUnits="userSpaceOnUse" width="1800" height="4800"><image href="${opts.swatch}" width="1800" height="4800" preserveAspectRatio="none"/></pattern>
      <pattern id="wh${id}" patternUnits="userSpaceOnUse" width="1800" height="4800" patternTransform="rotate(90)"><image href="${opts.swatch}" width="1800" height="4800" preserveAspectRatio="none"/></pattern>
      <linearGradient id="glass${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dfe9ea"/><stop offset=".55" stop-color="#b9cdd1"/><stop offset="1" stop-color="#9fb6bb"/></linearGradient>
    </defs>
    ${parts.join("").replace(/url\(#(wv|wh|glass)\)/g, `url(#$1${id})`)}
    ${dims}
  </svg>`;
}

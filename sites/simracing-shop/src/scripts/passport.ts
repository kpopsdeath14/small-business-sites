// "Паспорт заказа": a build sheet shown on the finish screen and saveable as an image.
import { items, rub, esc, pimg } from "./cart";

export type PassportData = {
  oid: string;
  date: Date;
  name: string;
  ship: string;
  pay: string;
  lap: string;
  lines: { id: string; q: number }[];
  total: number;
};

const MANAGER = "Илья Вихарев";
const fmtDate = (d: Date) => d.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });

export function passportHTML(d: PassportData) {
  const rows = d.lines.map((l) => {
    const it = items[l.id];
    return `<li class="pass__item">
      <span class="pass__img studio"><img src="${pimg(it.i)}" alt=""></span>
      <span class="pass__nm"><b>${esc(it.n)}</b>${it.v ? `<small>${esc(it.v)}</small>` : ""}</span>
      <span class="pass__q">×${l.q}</span>
      <span class="pass__p">${rub(it.p * l.q)}</span>
    </li>`;
  }).join("");
  return `<div class="pass__head">
      <span class="pass__brand">RSEAT <em>RUSSIA</em></span>
      <span class="tag">Паспорт заказа</span>
    </div>
    <p class="pass__oid">${esc(d.oid)}</p>
    <dl class="pass__meta">
      <div><dt class="tag">Пилот</dt><dd>${esc(d.name)}</dd></div>
      <div><dt class="tag">Дата</dt><dd>${fmtDate(d.date)}</dd></div>
      <div><dt class="tag">Получение</dt><dd>${esc(d.ship)}</dd></div>
      <div><dt class="tag">Инженер</dt><dd>${MANAGER}</dd></div>
    </dl>
    <ul class="pass__list">${rows}</ul>
    <div class="pass__foot">
      <div><span class="tag">Итого</span><strong>${rub(d.total)}</strong></div>
      <div class="pass__lap"><span class="tag">Круг оформления</span><b>${esc(d.lap)}</b></div>
    </div>
    <span class="pass__cheq" aria-hidden="true"></span>`;
}

const load = (src: string) => new Promise<HTMLImageElement | null>((res) => {
  const im = new Image();
  im.onload = () => res(im);
  im.onerror = () => res(null);
  im.src = src;
});

/** Draw the passport on a 1080×1350 canvas (4:5, fits a phone screen / story) and save or share it. */
export async function savePassport(d: PassportData) {
  await Promise.all([
    document.fonts.load('300 64px "Unbounded Variable"'),
    document.fonts.load('500 30px "Inter Tight Variable"'),
    document.fonts.load('400 22px "JetBrains Mono"'),
  ]).catch(() => {});
  const W = 1080, H = 1350, P = 80;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d")!;
  const DISPLAY = '"Unbounded Variable", sans-serif', SANS = '"Inter Tight Variable", sans-serif', MONO = '"JetBrains Mono", monospace';

  x.fillStyle = "#0b0c0e"; x.fillRect(0, 0, W, H);
  const glow = x.createRadialGradient(W * 0.8, 0, 0, W * 0.8, 0, 700);
  glow.addColorStop(0, "rgba(255,45,32,0.16)"); glow.addColorStop(1, "rgba(255,45,32,0)");
  x.fillStyle = glow; x.fillRect(0, 0, W, H);
  x.strokeStyle = "rgba(236,240,245,0.12)"; x.lineWidth = 2; x.strokeRect(30, 30, W - 60, H - 60);

  // header
  x.fillStyle = "#ff2d20"; x.beginPath(); x.arc(P + 14, P + 26, 14, 0, 7); x.fill();
  x.fillStyle = "#eceff2"; x.font = `500 34px ${DISPLAY}`; x.textBaseline = "middle";
  x.fillText("RSEAT", P + 44, P + 28);
  x.fillStyle = "#5d636c"; x.font = `400 20px ${MONO}`; x.textAlign = "right";
  x.fillText("ПАСПОРТ ЗАКАЗА", W - P, P + 28); x.textAlign = "left";

  x.fillStyle = "#eceff2"; x.font = `300 76px ${DISPLAY}`; x.textBaseline = "alphabetic";
  x.fillText(d.oid, P, P + 170);

  // meta grid
  const meta: [string, string][] = [["ПИЛОТ", d.name], ["ДАТА", fmtDate(d.date)], ["ПОЛУЧЕНИЕ", d.ship], ["ИНЖЕНЕР", MANAGER]];
  meta.forEach(([k, v], i) => {
    const cx = P + (i % 2) * 460, cy = P + 250 + Math.floor(i / 2) * 100;
    x.fillStyle = "#5d636c"; x.font = `400 18px ${MONO}`; x.fillText(k, cx, cy);
    x.fillStyle = "#eceff2"; x.font = `500 28px ${SANS}`;
    let t = v; while (x.measureText(t).width > 420 && t.length > 4) t = t.slice(0, -2);
    x.fillText(t === v ? v : t + "…", cx, cy + 40);
  });
  x.fillStyle = "rgba(236,240,245,0.1)"; x.fillRect(P, P + 470, W - P * 2, 2);

  // items (up to 5)
  const shown = d.lines.slice(0, 5);
  const imgs = await Promise.all(shown.map((l) => load(pimg(items[l.id].i))));
  shown.forEach((l, i) => {
    const it = items[l.id], y = P + 500 + i * 120;
    x.fillStyle = "#eceef0"; x.fillRect(P, y, 96, 96);
    const im = imgs[i]; if (im) x.drawImage(im, P, y, 96, 96);
    x.fillStyle = "#eceff2"; x.font = `500 30px ${SANS}`; x.fillText(it.n, P + 124, y + 40);
    x.fillStyle = "#9298a1"; x.font = `400 24px ${SANS}`; x.fillText([it.v, `× ${l.q}`].filter(Boolean).join(" · "), P + 124, y + 78);
    x.fillStyle = "#eceff2"; x.font = `500 28px ${SANS}`; x.textAlign = "right"; x.fillText(rub(it.p * l.q), W - P, y + 40); x.textAlign = "left";
  });
  if (d.lines.length > 5) { x.fillStyle = "#9298a1"; x.font = `400 22px ${MONO}`; x.fillText(`+ ещё ${d.lines.length - 5}`, P + 124, P + 500 + 5 * 120); }

  // total + lap
  const fy = H - 260;
  x.fillStyle = "rgba(236,240,245,0.1)"; x.fillRect(P, fy - 40, W - P * 2, 2);
  x.fillStyle = "#5d636c"; x.font = `400 18px ${MONO}`; x.fillText("ИТОГО", P, fy);
  x.fillStyle = "#eceff2"; x.font = `300 64px ${DISPLAY}`; x.fillText(rub(d.total), P, fy + 74);
  x.textAlign = "right"; x.fillStyle = "#5d636c"; x.font = `400 18px ${MONO}`; x.fillText("КРУГ ОФОРМЛЕНИЯ", W - P, fy);
  x.fillStyle = "#c98bff"; x.font = `400 40px ${MONO}`; x.fillText(d.lap, W - P, fy + 66); x.textAlign = "left";

  // chequered strip
  for (let i = 0; i < (W - 60) / 20; i++) for (let r = 0; r < 2; r++) {
    x.fillStyle = (i + r) % 2 ? "#eceff2" : "#0b0c0e";
    x.fillRect(30 + i * 20, H - 70 + r * 20, 20, 20);
  }

  const blob: Blob | null = await new Promise((r) => c.toBlob(r, "image/png"));
  if (!blob) return;
  const file = new File([blob], `RSEAT-${d.oid}.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: `Паспорт заказа ${d.oid}` }); return; } catch (e) { if ((e as Error).name === "AbortError") return; }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = file.name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

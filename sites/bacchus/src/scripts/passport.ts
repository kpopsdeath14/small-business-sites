// «Паспорт погреба»: the order set as a wine label, shown on the finish screen and saveable as an image.
import { items, rub, esc, pimg } from "./cart";

export type PassportData = {
  oid: string;
  date: Date;
  name: string;
  ship: string;
  pay: string;
  lines: { id: string; q: number }[];
  total: number;
  bottles: number;
};

const fmtDate = (d: Date) => d.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });

export function passportHTML(d: PassportData) {
  const rows = d.lines.map((l) => {
    const it = items[l.id];
    return `<li class="pass__item">
      <span class="pass__img paper"><img src="${pimg(it.i)}" alt=""></span>
      <span class="pass__nm"><b>${esc(it.n)}</b><small>${esc(it.v)}${it.b ? ` · ${it.b} бут.` : ""}</small></span>
      <span class="pass__q">×${l.q}</span>
      <span class="pass__p">${rub(it.p * l.q)}</span>
    </li>`;
  }).join("");
  return `<div class="pass__head">
      <span class="pass__brand">Подвалы Бахуса</span>
      <span class="pass__k">Паспорт погреба</span>
    </div>
    <p class="pass__oid">${esc(d.oid)}</p>
    ${d.bottles ? `<p class="pass__b"><b>${d.bottles}</b> бутылок · 12 °C · 70 %</p>` : ""}
    <dl class="pass__meta">
      <div><dt>Владелец</dt><dd>${esc(d.name)}</dd></div>
      <div><dt>Дата</dt><dd>${fmtDate(d.date)}</dd></div>
      <div><dt>Получение</dt><dd>${esc(d.ship)}</dd></div>
      <div><dt>Оплата</dt><dd>${esc(d.pay)}</dd></div>
    </dl>
    <ul class="pass__list">${rows}</ul>
    <div class="pass__foot"><span>Итого</span><strong>${rub(d.total)}</strong></div>
    <i class="pass__stain" aria-hidden="true"></i>`;
}

const load = (src: string) => new Promise<HTMLImageElement | null>((res) => {
  const im = new Image();
  im.onload = () => res(im);
  im.onerror = () => res(null);
  im.src = src;
});

/** Draw the label on a 1080×1350 canvas (4:5, fits a phone screen) and share or save it. */
export async function savePassport(d: PassportData) {
  await Promise.all([
    document.fonts.load('400 64px "Oranienbaum"'),
    document.fonts.load('500 30px "Golos Text Variable"'),
    document.fonts.load('400 22px "IBM Plex Mono"'),
  ]).catch(() => {});
  const W = 1080, H = 1350, P = 96;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d")!;
  const DISPLAY = '"Oranienbaum", serif', SANS = '"Golos Text Variable", sans-serif', MONO = '"IBM Plex Mono", monospace';
  const INK = "#1c1512", SOFT = "#6d5f53", WINE = "#8f1d33";

  // label paper with a double frame
  const g = x.createRadialGradient(W * 0.3, H * 0.2, 0, W * 0.3, H * 0.2, H);
  g.addColorStop(0, "#f8f2e8"); g.addColorStop(0.6, "#efe7da"); g.addColorStop(1, "#e2d6c3");
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.strokeStyle = "rgba(28,21,18,0.35)"; x.lineWidth = 2; x.strokeRect(36, 36, W - 72, H - 72);
  x.strokeStyle = "rgba(28,21,18,0.15)"; x.strokeRect(48, 48, W - 96, H - 96);

  // a ring left by a glass of red
  x.save(); x.translate(W - 150, 330); x.strokeStyle = "rgba(125,22,42,0.16)"; x.lineWidth = 7;
  x.beginPath(); x.arc(0, 0, 118, 0.4, 5.2); x.stroke(); x.lineWidth = 2; x.strokeStyle = "rgba(125,22,42,0.12)"; x.beginPath(); x.arc(4, 3, 126, 0.1, 4.4); x.stroke(); x.restore();
  x.textBaseline = "alphabetic";
  x.fillStyle = WINE; x.font = `400 22px ${MONO}`; x.fillText("ПОДВАЛЫ БАХУСА", P, P + 30);
  x.textAlign = "right"; x.fillStyle = SOFT; x.fillText("ПАСПОРТ ПОГРЕБА", W - P, P + 30); x.textAlign = "left";
  x.fillStyle = INK; x.font = `400 92px ${DISPLAY}`; x.fillText(d.oid, P, P + 150);
  if (d.bottles) { x.fillStyle = WINE; x.font = `400 26px ${MONO}`; x.fillText(`${d.bottles} БУТЫЛОК · 12 °C · 70 %`, P, P + 200); }

  const meta: [string, string][] = [["ВЛАДЕЛЕЦ", d.name], ["ДАТА", fmtDate(d.date)], ["ПОЛУЧЕНИЕ", d.ship], ["ОПЛАТА", d.pay]];
  meta.forEach(([k, v], i) => {
    const cx = P + (i % 2) * 450, cy = P + 270 + Math.floor(i / 2) * 96;
    x.fillStyle = SOFT; x.font = `400 18px ${MONO}`; x.fillText(k, cx, cy);
    x.fillStyle = INK; x.font = `500 28px ${SANS}`;
    let t = v; while (x.measureText(t).width > 410 && t.length > 4) t = t.slice(0, -2);
    x.fillText(t === v ? v : t + "…", cx, cy + 38);
  });
  x.fillStyle = "rgba(28,21,18,0.2)"; x.fillRect(P, P + 470, W - P * 2, 2);

  const shown = d.lines.slice(0, 5);
  const imgs = await Promise.all(shown.map((l) => load(pimg(items[l.id].i))));
  shown.forEach((l, i) => {
    const it = items[l.id], y = P + 500 + i * 118;
    x.fillStyle = "#fff"; x.fillRect(P, y, 80, 100);
    const im = imgs[i]; if (im) x.drawImage(im, P, y, 80, 100);
    x.fillStyle = INK; x.font = `400 38px ${DISPLAY}`; x.fillText(it.n, P + 108, y + 44);
    x.fillStyle = SOFT; x.font = `400 22px ${SANS}`; x.fillText([it.v, it.b ? `${it.b} бут.` : "", `× ${l.q}`].filter(Boolean).join(" · "), P + 108, y + 80);
    x.fillStyle = INK; x.font = `500 26px ${SANS}`; x.textAlign = "right"; x.fillText(rub(it.p * l.q), W - P, y + 44); x.textAlign = "left";
  });
  if (d.lines.length > 5) { x.fillStyle = SOFT; x.font = `400 22px ${MONO}`; x.fillText(`+ ЕЩЁ ${d.lines.length - 5}`, P + 108, P + 500 + 5 * 118); }

  const fy = H - 190;
  x.fillStyle = "rgba(28,21,18,0.2)"; x.fillRect(P, fy - 50, W - P * 2, 2);
  x.fillStyle = SOFT; x.font = `400 18px ${MONO}`; x.fillText("ИТОГО", P, fy);
  x.fillStyle = INK; x.font = `400 80px ${DISPLAY}`; x.fillText(rub(d.total), P, fy + 78);
  x.textAlign = "right"; x.fillStyle = SOFT; x.font = `400 18px ${MONO}`; x.fillText("+7 (495) 518-25-50", W - P, fy + 72); x.textAlign = "left";

  const blob: Blob | null = await new Promise((r) => c.toBlob(r, "image/png"));
  if (!blob) return;
  const file = new File([blob], `Подвалы-Бахуса-${d.oid}.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: `Паспорт погреба ${d.oid}` }); return; } catch (e) { if ((e as Error).name === "AbortError") return; }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = file.name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

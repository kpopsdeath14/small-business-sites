// Cart lives in this browser only (localStorage). Orders are sent to the manager at checkout.
export type Line = { id: string; q: number };
type Item = { n: string; v: string; p: number; i: string; s: string; st: "in" | "pre" };

const KEY = "rseat-cart-v1";
const data = JSON.parse(document.getElementById("cart-index")!.textContent!) as { base: string; items: Record<string, Item> };
export const BASE = data.base;
export const items = data.items;

let lines: Line[] = read();

function read(): Line[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]") as Line[];
    return raw.filter((l) => items[l.id] && l.q > 0);
  } catch {
    return [];
  }
}
function write() {
  try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch {}
  document.dispatchEvent(new CustomEvent("cart:change"));
}

export const cart = {
  lines: () => lines.slice(),
  count: () => lines.reduce((s, l) => s + l.q, 0),
  total: () => lines.reduce((s, l) => s + l.q * items[l.id].p, 0),
  add(id: string, q = 1) {
    const l = lines.find((x) => x.id === id);
    if (l) l.q = Math.min(99, l.q + q);
    else lines.push({ id, q });
    write();
  },
  set(id: string, q: number) {
    if (q <= 0) return cart.remove(id);
    const l = lines.find((x) => x.id === id);
    if (l) { l.q = Math.min(99, q); write(); }
  },
  remove(id: string) { lines = lines.filter((l) => l.id !== id); write(); },
  clear() { lines = []; write(); },
};

// keep tabs in sync
addEventListener("storage", (e) => { if (e.key === KEY) { lines = read(); document.dispatchEvent(new CustomEvent("cart:change")); } });

export const rub = (n: number) => n.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽";
export const pimg = (id: string, w = 600) => `${BASE}/p/${id}-${w}.webp`;
export const purl = (slug: string) => `${BASE}/product/${slug}/`;
export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function lineHTML(l: Line, opts: { compact?: boolean } = {}) {
  const it = items[l.id];
  return `<div class="line-item" data-line="${l.id}">
    <a class="line-item__img studio" href="${purl(it.s)}"><img src="${pimg(it.i)}" alt="" loading="lazy"></a>
    <div>
      <a class="line-item__name" href="${purl(it.s)}">${esc(it.n)}</a>
      ${it.v ? `<p class="line-item__var">${esc(it.v)}</p>` : ""}
      ${opts.compact ? "" : `<p class="tag" style="margin-top:6px">${it.st === "in" ? "В наличии" : "Предзаказ · 2–3 недели"}</p>`}
      <div class="line-item__row">
        <div class="qty" role="group" aria-label="Количество">
          <button type="button" data-dec aria-label="Меньше">−</button><output>${l.q}</output><button type="button" data-inc aria-label="Больше">+</button>
        </div>
        <span class="line-item__price">${rub(it.p * l.q)}</span>
      </div>
      <button type="button" class="line-item__rm" data-rm style="margin-top:10px">Удалить</button>
    </div>
  </div>`;
}

/** Wire +/−/remove buttons inside a container of .line-item rows. */
let lastQ: { id: string; dir: number } | null = null;
export function bindLines(root: HTMLElement) {
  root.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    const row = t.closest<HTMLElement>("[data-line]");
    if (!row) return;
    const id = row.dataset.line!;
    const l = cart.lines().find((x) => x.id === id);
    if (!l) return;
    const drop = () => {
      // retire the row like a car peeling into the pit lane, then remove it
      row.style.overflow = "hidden";
      row.animate(
        [{ opacity: 1, transform: "none", height: `${row.offsetHeight}px` }, { opacity: 0, transform: "translateX(-40px)", height: `${row.offsetHeight}px`, offset: 0.6 }, { opacity: 0, transform: "translateX(-40px)", height: "0px", paddingTop: "0px", paddingBottom: "0px" }],
        { duration: 420, easing: "cubic-bezier(.7,0,.2,1)" },
      ).onfinish = () => cart.remove(id);
    };
    if (t.closest("[data-inc]")) { lastQ = { id, dir: 1 }; cart.set(id, l.q + 1); }
    else if (t.closest("[data-dec]")) { if (l.q <= 1) drop(); else { lastQ = { id, dir: -1 }; cart.set(id, l.q - 1); } }
    else if (t.closest("[data-rm]")) drop();
  });
}
/** After re-rendering rows, roll the changed quantity like a gear indicator. */
export function afterRender(root: HTMLElement) {
  if (!lastQ) return;
  const o = root.querySelector(`[data-line="${lastQ.id}"] output`);
  if (o) gear(o as HTMLElement, lastQ.dir);
}
export function gear(el: HTMLElement, dir: number) {
  el.animate([{ transform: `translateY(${dir * 70}%)`, opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 300, easing: "cubic-bezier(.16,1,.3,1)" });
}

/** Free-delivery "track": a car runs towards the chequered line as the order grows. */
export const FREE = 200000;
export function trackHTML(sub: number) {
  // past the threshold there is nothing left to race for: just say so
  if (sub >= FREE) return `<p class="track-done tag"><span class="track__flag"></span>Доставка бесплатно</p>`;
  const p = (sub / FREE) * 100;
  return `<div class="track" style="--p:${p.toFixed(1)}%">
    <div class="track__bar"><i></i><span class="track__car"></span><span class="track__flag"></span></div>
    <p class="tag track__t">До бесплатной доставки · ${rub(FREE - sub)}</p>
  </div>`;
}

/** Timing-screen style: digits run from the current value to the new one. */
export function rollPrice(el: HTMLElement, to: number) {
  const from = Number(el.dataset.val ?? el.textContent!.replace(/\D/g, "")) || to;
  el.dataset.val = String(to);
  if (from === to || matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = rub(to); return; }
  const t0 = performance.now(), dur = 560;
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    el.textContent = rub(Math.round(from + (to - from) * e));
    if (k < 1 && el.dataset.val === String(to)) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// The client takes orders by phone, e-mail and Telegram (@kaminline). A Telegram link cannot
// carry text to a personal chat, so we copy the message first and say so.
export const TG = "https://t.me/kaminline";
export const MAIL = "kaminline@mail.ru";

export async function copy(text: string) {
  try { await navigator.clipboard.writeText(text); return true; } catch {}
  try {
    const t = document.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
    document.body.appendChild(t); t.select(); const ok = document.execCommand("copy"); t.remove(); return ok;
  } catch { return false; }
}
export async function sendTelegram(text: string, note?: HTMLElement | null) {
  const ok = await copy(text);
  if (note) { note.hidden = false; note.textContent = ok ? "Текст скопирован — вставьте его в чат с менеджером." : "Откройте чат и опишите заказ — мы ответим быстро."; }
  window.open(TG, "_blank", "noopener");
}
export const mailto = (subject: string, body: string) => `mailto:${MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export function phoneMask(input: HTMLInputElement) {
  input.addEventListener("input", () => {
    let d = input.value.replace(/\D/g, "");
    if (d.startsWith("8")) d = "7" + d.slice(1);
    if (!d.startsWith("7")) d = "7" + d;
    d = d.slice(0, 11);
    const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
    input.value = "+7" + (p[0] ? ` (${p[0]}` : "") + (p[0].length === 3 ? ")" : "") + (p[1] ? ` ${p[1]}` : "") + (p[2] ? `-${p[2]}` : "") + (p[3] ? `-${p[3]}` : "");
  });
}

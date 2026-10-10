/**
 * The sound of a fire, synthesised on the fly (no audio files): a soft low roar of the flame
 * and random crackles of the logs. Off by default; the visitor's choice is remembered.
 * Intensity follows `hearth` events (0..1), sent by the "how a fireplace burns" chapter.
 */
const KEY = "kl-sound";
const root = document.documentElement;
const btns = [...document.querySelectorAll<HTMLButtonElement>("[data-sound]")];

let ctx: AudioContext | null = null;
let master: GainNode, roar: GainNode, noise: AudioBuffer;
let on = false, level = 0.55, timer = 0;

function build() {
  ctx = new AudioContext();
  master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  // two seconds of brown noise, reused for the roar and (sliced) for every crackle
  const n = ctx.sampleRate * 2;
  noise = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = noise.getChannelData(0);
  let last = 0;
  for (let i = 0; i < n; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
  const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 520;
  roar = ctx.createGain(); roar.gain.value = 0.5;
  src.connect(lp).connect(roar).connect(master); src.start();
}

/** One crackle: a few milliseconds of noise through a resonant band, with a sharp decay. */
function crackle(t: number, deep = false) {
  if (!ctx) return;
  const s = ctx.createBufferSource(); s.buffer = noise;
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass";
  bp.frequency.value = deep ? 280 + Math.random() * 500 : 1600 + Math.random() * 4200;
  bp.Q.value = deep ? 2 : 0.9 + Math.random() * 2;
  const g = ctx.createGain();
  const peak = (deep ? 1.4 : 0.5 + Math.random() * 0.9) * (0.4 + level);
  const len = deep ? 0.07 : 0.008 + Math.random() * 0.03;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0008, t + len);
  s.connect(bp).connect(g).connect(master);
  s.start(t, Math.random() * 1.8, len + 0.02);
}

function schedule() {
  if (!ctx || !on) return;
  const t = ctx.currentTime + 0.02;
  const burst = Math.random() < 0.18 ? 2 + Math.floor(Math.random() * 4) : 1;
  for (let i = 0; i < burst; i++) crackle(t + i * (0.012 + Math.random() * 0.04));
  if (Math.random() < 0.05 * (0.5 + level)) crackle(t + 0.05, true);
  // the roar breathes slowly
  roar.gain.setTargetAtTime(0.32 + level * 0.4 + Math.random() * 0.12, t, 0.6);
  const gap = (60 + Math.random() * 420) / (0.45 + level);
  timer = window.setTimeout(schedule, gap);
}

function set(next: boolean, save = true) {
  on = next;
  btns.forEach((b) => { b.setAttribute("aria-pressed", String(on)); b.setAttribute("aria-label", on ? "Выключить звук камина" : "Включить звук камина"); });
  root.classList.toggle("sound-on", on);
  if (save) try { localStorage.setItem(KEY, on ? "1" : "0"); } catch {}
  if (on) {
    if (!ctx) build();
    ctx!.resume();
    master.gain.setTargetAtTime(0.22, ctx!.currentTime, 0.5);
    clearTimeout(timer); schedule();
  } else if (ctx) {
    clearTimeout(timer);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    const c = ctx; setTimeout(() => { if (!on) c.suspend(); }, 1200);
  }
}

document.addEventListener("hearth", (e) => { level = (e as CustomEvent<number>).detail; });
document.addEventListener("visibilitychange", () => {
  if (!ctx || !on) return;
  if (document.hidden) { clearTimeout(timer); ctx.suspend(); } else { ctx.resume(); schedule(); }
});

// remembered "on": browsers allow sound only after a gesture, so it resumes on the first tap
let pending = false;
try { pending = localStorage.getItem(KEY) === "1"; } catch {}
if (pending) {
  btns.forEach((b) => b.setAttribute("aria-pressed", "true"));
  root.classList.add("sound-on");
  addEventListener("pointerdown", (e) => {
    if (!pending || (e.target as Element).closest("[data-sound]")) return;
    pending = false; set(true, false);
  }, { capture: true });
}
btns.forEach((b) => b.addEventListener("click", () => {
  if (pending) { pending = false; set(true); } else set(!on);
}));

/**
 * The cart: a tiny observable store shared by two very different consumers — the Preact drawer
 * island and the plain `<script>` that wires the Astro-rendered "в корзину" buttons.
 *
 * It lives on `window` rather than in module scope on purpose. Astro bundles hoisted scripts and
 * framework islands into separate entry chunks, and whether Vite hoists a shared import into one
 * common chunk depends on the build's chunking decisions — a detail no feature should depend on.
 * A `window` singleton makes "one cart per page" true by construction: whichever side loads first
 * creates it, the other finds it.
 */

export interface CartItemInput {
  id: string;
  name: string;
  price: number;
  photo?: string;
  sku?: string;
  /** Used by the delivery estimate; the store falls back to 0.5 kg per unit. */
  weightKg?: number;
}

export interface CartLine extends CartItemInput {
  qty: number;
}

type Listener = (lines: CartLine[]) => void;

export interface CartStore {
  lines(): CartLine[];
  add(item: CartItemInput, qty?: number): void;
  setQty(id: string, qty: number): void;
  remove(id: string): void;
  clear(): void;
  count(): number;
  total(): number;
  weight(): number;
  subscribe(listener: Listener): () => void;
  /** Asks the drawer to open. The drawer island registers the handler; before it hydrates the
   *  request is remembered and replayed, so an early tap is never swallowed. */
  requestOpen(): void;
  onOpenRequest(handler: () => void): () => void;
}

declare global {
  interface Window {
    __vitrinaCart?: CartStore;
  }
}

const DEFAULT_UNIT_WEIGHT_KG = 0.5;
const STORAGE_PREFIX = "vitrina-cart:";

/** Every demo site shares one GitHub Pages origin, so the key must be scoped per store —
 *  otherwise two sites on the same host would hand each other their carts. */
function load(scope: string): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + scope);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line): line is CartLine =>
        !!line && typeof line.id === "string" && typeof line.name === "string" && typeof line.price === "number" && typeof line.qty === "number"
    );
  } catch {
    // Private mode, blocked site data, corrupted JSON — an empty cart is always a valid state.
    return [];
  }
}

function save(scope: string, lines: CartLine[]): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + scope, JSON.stringify(lines));
  } catch {
    /* Storage is a convenience here; the in-memory cart keeps working without it. */
  }
}

function createCart(scope: string): CartStore {
  let lines: CartLine[] = load(scope);
  const listeners = new Set<Listener>();
  const openHandlers = new Set<() => void>();
  let pendingOpen = false;

  const emit = () => {
    save(scope, lines);
    for (const listener of listeners) listener(lines);
  };

  return {
    lines: () => lines,
    add(item, qty = 1) {
      const existing = lines.find((line) => line.id === item.id);
      if (existing) {
        lines = lines.map((line) => (line.id === item.id ? { ...line, qty: line.qty + qty } : line));
      } else {
        lines = [...lines, { ...item, qty }];
      }
      emit();
    },
    setQty(id, qty) {
      lines = qty <= 0 ? lines.filter((line) => line.id !== id) : lines.map((line) => (line.id === id ? { ...line, qty } : line));
      emit();
    },
    remove(id) {
      lines = lines.filter((line) => line.id !== id);
      emit();
    },
    clear() {
      lines = [];
      emit();
    },
    count: () => lines.reduce((sum, line) => sum + line.qty, 0),
    total: () => lines.reduce((sum, line) => sum + line.price * line.qty, 0),
    weight: () => lines.reduce((sum, line) => sum + (line.weightKg ?? DEFAULT_UNIT_WEIGHT_KG) * line.qty, 0),
    subscribe(listener) {
      listeners.add(listener);
      listener(lines);
      return () => listeners.delete(listener);
    },
    requestOpen() {
      if (openHandlers.size === 0) {
        pendingOpen = true;
        return;
      }
      for (const handler of openHandlers) handler();
    },
    onOpenRequest(handler) {
      openHandlers.add(handler);
      if (pendingOpen) {
        pendingOpen = false;
        handler();
      }
      return () => openHandlers.delete(handler);
    },
  };
}

export function getCart(scope: string): CartStore {
  if (!window.__vitrinaCart) window.__vitrinaCart = createCart(scope);
  return window.__vitrinaCart;
}

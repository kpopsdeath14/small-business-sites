import { useState } from "preact/hooks";

interface Props {
  submitLabel: string;
  successMessage: string;
  serviceOptions?: string[];
  phone?: string;
}

export default function BookingForm({ submitLabel, successMessage, serviceOptions, phone }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || sending) return;
    // Brief "sending" beat before the success panel: the click gets visible feedback
    // instead of an instant swap, which reads as more trustworthy.
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 500);
  };

  if (submitted) {
    return (
      <div class="animate-scale-in rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
        {/* Checkmark pops and draws itself in — quiet celebration, no confetti. */}
        <svg
          class="success-check mx-auto mb-3"
          width="52"
          height="52"
          viewBox="0 0 52 52"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="26" cy="26" r="24" stroke="var(--color-primary)" stroke-width="2" opacity="0.35" />
          <path
            class="success-check-path"
            d="M15 27l7.5 7.5L37 19"
            stroke="var(--color-primary)"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <p class="text-[var(--color-text)] font-medium">{successMessage}</p>
        {phone && <p class="mt-2 text-sm text-[var(--color-text-muted)]">Или позвоните: {phone}</p>}
      </div>
    );
  }

  return (
    <form class="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label class="block text-sm text-[var(--color-text-muted)] mb-1" for="bf-name">
          Имя
        </label>
        <input
          id="bf-name"
          type="text"
          required
          value={name}
          onInput={(e) => setName((e.target as HTMLInputElement).value)}
          class="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-text)] transition-colors duration-200 focus:border-[var(--color-primary)]"
        />
      </div>

      <div>
        <label class="block text-sm text-[var(--color-text-muted)] mb-1" for="bf-contact">
          Телефон
        </label>
        <input
          id="bf-contact"
          type="tel"
          required
          value={contact}
          onInput={(e) => setContact((e.target as HTMLInputElement).value)}
          class="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-text)] transition-colors duration-200 focus:border-[var(--color-primary)]"
        />
      </div>

      {serviceOptions && serviceOptions.length > 0 && (
        <div>
          <label class="block text-sm text-[var(--color-text-muted)] mb-1" for="bf-service">
            Услуга
          </label>
          <select
            id="bf-service"
            class="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-text)] transition-colors duration-200 focus:border-[var(--color-primary)]"
          >
            {serviceOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        class="w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-primary-contrast)] py-3 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
      >
        {sending && (
          <span
            class="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent align-middle"
            style="animation: bf-spin 0.7s linear infinite"
            aria-hidden="true"
          />
        )}
        {sending ? "Отправляем…" : submitLabel}
      </button>

      <style>{`
        @keyframes bf-spin {
          to { transform: rotate(360deg); }
        }
        .success-check-path {
          stroke-dasharray: 34;
          stroke-dashoffset: 34;
          animation: bf-draw 0.45s ease-out 0.25s forwards;
        }
        .success-check {
          transform: scale(0.6);
          opacity: 0;
          animation: bf-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes bf-pop {
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes bf-draw {
          to { stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .success-check, .success-check-path { animation: none; transform: none; opacity: 1; stroke-dashoffset: 0; }
        }
      `}</style>
    </form>
  );
}
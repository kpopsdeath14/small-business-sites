import { useState } from "preact/hooks";

interface Props {
  submitLabel: string;
  successMessage: string;
  serviceOptions?: string[];
  phone?: string;
}

export default function BookingForm({ submitLabel, successMessage, serviceOptions, phone }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  if (submitted) {
    return (
      <div class="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
        <p class="text-[var(--color-text)] font-medium">{successMessage}</p>
        {phone && <p class="mt-2 text-sm text-[var(--color-text-muted)]">Или позвоните: {phone}</p>}
      </div>
    );
  }

  return (
    <form
      class="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim() || !contact.trim()) return;
        setSubmitted(true);
      }}
    >
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
          class="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-text)]"
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
          class="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-text)]"
        />
      </div>

      {serviceOptions && serviceOptions.length > 0 && (
        <div>
          <label class="block text-sm text-[var(--color-text-muted)] mb-1" for="bf-service">
            Услуга
          </label>
          <select
            id="bf-service"
            class="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-text)]"
          >
            {serviceOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        class="w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-primary-contrast)] py-3 text-sm font-medium hover:opacity-90 transition-opacity"
      >
        {submitLabel}
      </button>
    </form>
  );
}

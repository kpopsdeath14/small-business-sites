import type { DesignTokens } from "@sitegen/shared-ui/types.ts";

const DISPLAY = "'Oswald', 'Arial Narrow Bold', sans-serif";
const BODY = "'Inter', -apple-system, 'Segoe UI', system-ui, sans-serif";

export const tokenSets: DesignTokens[] = [
  {
    // Bottle Green & Brass — classic gentleman's barbershop.
    "--color-bg": "#121712",
    "--color-surface": "#1B231C",
    "--color-text": "#F2EEE3",
    "--color-text-muted": "#A7A192",
    "--color-primary": "#C6A24D",
    "--color-primary-contrast": "#121712",
    "--color-accent": "#C6A24D",
    "--color-border": "#2A332B",
    "--font-heading": DISPLAY,
    "--font-body": BODY,
    "--radius-sm": "2px",
    "--radius-md": "3px",
    "--radius-lg": "4px",
    "--shadow-card": "0 8px 26px rgba(0,0,0,0.45)",
    "--shadow-elevated": "0 18px 50px rgba(0,0,0,0.55)",
  },
  {
    // Charcoal & Rust — worn leather, warm rust accent.
    "--color-bg": "#181513",
    "--color-surface": "#231D19",
    "--color-text": "#F1EBE2",
    "--color-text-muted": "#AB9E8F",
    "--color-primary": "#C1552C",
    "--color-primary-contrast": "#F1EBE2",
    "--color-accent": "#C1552C",
    "--color-border": "#332A23",
    "--font-heading": DISPLAY,
    "--font-body": BODY,
    "--radius-sm": "2px",
    "--radius-md": "3px",
    "--radius-lg": "4px",
    "--shadow-card": "0 8px 26px rgba(0,0,0,0.45)",
    "--shadow-elevated": "0 18px 50px rgba(0,0,0,0.55)",
  },
  {
    // Barbershop Cream — light inversion, deep green ink on warm paper.
    "--color-bg": "#EFE9D8",
    "--color-surface": "#E3DAC0",
    "--color-text": "#181F19",
    "--color-text-muted": "#655E4D",
    "--color-primary": "#33472F",
    "--color-primary-contrast": "#EFE9D8",
    "--color-accent": "#A6803A",
    "--color-border": "#D5C9A8",
    "--font-heading": DISPLAY,
    "--font-body": BODY,
    "--radius-sm": "2px",
    "--radius-md": "3px",
    "--radius-lg": "4px",
    "--shadow-card": "0 8px 26px rgba(24,31,25,0.14)",
    "--shadow-elevated": "0 18px 44px rgba(24,31,25,0.2)",
  },
];

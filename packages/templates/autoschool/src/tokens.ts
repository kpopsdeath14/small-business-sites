import type { DesignTokens } from "@sitegen/shared-ui/types.ts";

const DISPLAY = "'Archivo Black', 'Arial Black', sans-serif";
const BODY = "'Inter', -apple-system, 'Segoe UI', system-ui, sans-serif";

export const tokenSets: DesignTokens[] = [
  {
    // Asphalt & Amber — road-sign energy, high contrast.
    "--color-bg": "#12151C",
    "--color-surface": "#1B2029",
    "--color-text": "#F3F4F2",
    "--color-text-muted": "#9CA1AC",
    "--color-primary": "#F5B300",
    "--color-primary-contrast": "#12151C",
    "--color-accent": "#F5B300",
    "--color-border": "#2A3040",
    "--font-heading": DISPLAY,
    "--font-body": BODY,
    "--radius-sm": "6px",
    "--radius-md": "10px",
    "--radius-lg": "16px",
    "--shadow-card": "0 10px 30px rgba(0,0,0,0.4)",
    "--shadow-elevated": "0 20px 50px rgba(0,0,0,0.5)",
  },
  {
    // Highway Blue — deep royal blue with amber accent.
    "--color-bg": "#0E1B33",
    "--color-surface": "#152546",
    "--color-text": "#F1F4FA",
    "--color-text-muted": "#98A6C2",
    "--color-primary": "#FFB627",
    "--color-primary-contrast": "#0E1B33",
    "--color-accent": "#4C8DFF",
    "--color-border": "#223564",
    "--font-heading": DISPLAY,
    "--font-body": BODY,
    "--radius-sm": "6px",
    "--radius-md": "10px",
    "--radius-lg": "16px",
    "--shadow-card": "0 10px 30px rgba(0,0,0,0.35)",
    "--shadow-elevated": "0 20px 50px rgba(0,0,0,0.45)",
  },
  {
    // Bright Signal — light bg, punchy red-orange accent, energetic daytime feel.
    "--color-bg": "#F5F6F8",
    "--color-surface": "#E9ECF2",
    "--color-text": "#12151C",
    "--color-text-muted": "#565D6B",
    "--color-primary": "#E8432A",
    "--color-primary-contrast": "#F5F6F8",
    "--color-accent": "#1A3FA0",
    "--color-border": "#DCE0E8",
    "--font-heading": DISPLAY,
    "--font-body": BODY,
    "--radius-sm": "6px",
    "--radius-md": "10px",
    "--radius-lg": "16px",
    "--shadow-card": "0 10px 26px rgba(18,21,28,0.08)",
    "--shadow-elevated": "0 20px 44px rgba(18,21,28,0.12)",
  },
];

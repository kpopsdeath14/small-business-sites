import type { DesignTokens } from "@sitegen/shared-ui/types.ts";

const DISPLAY = "'Plus Jakarta Sans', -apple-system, 'Segoe UI', system-ui, sans-serif";
const BODY = "'Plus Jakarta Sans', -apple-system, 'Segoe UI', system-ui, sans-serif";

export const tokenSets: DesignTokens[] = [
  {
    // Mint Clean — clinical calm, soft mint accent on white.
    "--color-bg": "#FFFFFF",
    "--color-surface": "#EFF7F4",
    "--color-text": "#131C1A",
    "--color-text-muted": "#5C6B67",
    "--color-primary": "#1F8A70",
    "--color-primary-contrast": "#FFFFFF",
    "--color-accent": "#63C2A6",
    "--color-border": "#DCEEE7",
    "--font-heading": DISPLAY,
    "--font-body": BODY,
    "--radius-sm": "10px",
    "--radius-md": "18px",
    "--radius-lg": "28px",
    "--shadow-card": "0 10px 30px rgba(19,28,26,0.06)",
    "--shadow-elevated": "0 20px 50px rgba(19,28,26,0.1)",
  },
  {
    // Sky Calm — airy blue-white, reassuring.
    "--color-bg": "#FBFDFF",
    "--color-surface": "#EAF3FB",
    "--color-text": "#101826",
    "--color-text-muted": "#5B6675",
    "--color-primary": "#2464A8",
    "--color-primary-contrast": "#FFFFFF",
    "--color-accent": "#6FA9DE",
    "--color-border": "#DCE9F5",
    "--font-heading": DISPLAY,
    "--font-body": BODY,
    "--radius-sm": "10px",
    "--radius-md": "18px",
    "--radius-lg": "28px",
    "--shadow-card": "0 10px 30px rgba(16,24,38,0.06)",
    "--shadow-elevated": "0 20px 50px rgba(16,24,38,0.1)",
  },
  {
    // Warm Porcelain — soft coral accent, friendly family-clinic feel.
    "--color-bg": "#FFFBF8",
    "--color-surface": "#FBEFE8",
    "--color-text": "#231A16",
    "--color-text-muted": "#6E635C",
    "--color-primary": "#D97757",
    "--color-primary-contrast": "#FFFFFF",
    "--color-accent": "#E8A385",
    "--color-border": "#F2E1D5",
    "--font-heading": DISPLAY,
    "--font-body": BODY,
    "--radius-sm": "10px",
    "--radius-md": "18px",
    "--radius-lg": "28px",
    "--shadow-card": "0 10px 30px rgba(35,26,22,0.07)",
    "--shadow-elevated": "0 20px 50px rgba(35,26,22,0.11)",
  },
];

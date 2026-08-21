import type { DesignTokens } from "@sitegen/shared-ui/types.ts";

const DISPLAY = "'Playfair Display', Georgia, 'Times New Roman', serif";
const BODY = "'Inter', -apple-system, 'Segoe UI', system-ui, sans-serif";

export const tokenSets: DesignTokens[] = [
  {
    // Terracotta & Olive — warm trattoria, cream paper, deep terracotta accent.
    "--color-bg": "#FAF5EC",
    "--color-surface": "#F0E5D3",
    "--color-text": "#2A211A",
    "--color-text-muted": "#77695A",
    "--color-primary": "#B5502E",
    "--color-primary-contrast": "#FAF5EC",
    "--color-accent": "#5C6B3F",
    "--color-border": "#E4D6BE",
    "--font-heading": DISPLAY,
    "--font-body": BODY,
    "--radius-sm": "4px",
    "--radius-md": "10px",
    "--radius-lg": "18px",
    "--shadow-card": "0 10px 30px rgba(42,33,26,0.1)",
    "--shadow-elevated": "0 20px 50px rgba(42,33,26,0.16)",
  },
  {
    // Midnight Bistro — deep charcoal, candlelit gold accent, upscale evening feel.
    "--color-bg": "#181410",
    "--color-surface": "#231D17",
    "--color-text": "#F2EBDE",
    "--color-text-muted": "#A79A87",
    "--color-primary": "#C79A4B",
    "--color-primary-contrast": "#181410",
    "--color-accent": "#C79A4B",
    "--color-border": "#312921",
    "--font-heading": DISPLAY,
    "--font-body": BODY,
    "--radius-sm": "4px",
    "--radius-md": "10px",
    "--radius-lg": "18px",
    "--shadow-card": "0 10px 30px rgba(0,0,0,0.4)",
    "--shadow-elevated": "0 20px 50px rgba(0,0,0,0.5)",
  },
  {
    // Burgundy Room — rich wine-red accent on warm white, classic fine-dining.
    "--color-bg": "#FBF8F5",
    "--color-surface": "#F1E7E0",
    "--color-text": "#241815",
    "--color-text-muted": "#6E5C55",
    "--color-primary": "#7A2331",
    "--color-primary-contrast": "#FBF8F5",
    "--color-accent": "#B08A4E",
    "--color-border": "#E7D8CE",
    "--font-heading": DISPLAY,
    "--font-body": BODY,
    "--radius-sm": "4px",
    "--radius-md": "10px",
    "--radius-lg": "18px",
    "--shadow-card": "0 10px 30px rgba(36,24,21,0.08)",
    "--shadow-elevated": "0 20px 50px rgba(36,24,21,0.13)",
  },
];

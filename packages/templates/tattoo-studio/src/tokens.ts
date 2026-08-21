import type { DesignTokens } from "@sitegen/shared-ui/types.ts";

const DISPLAY = "'Bebas Neue', 'Impact', 'Arial Narrow Bold', sans-serif";
const BODY = "'Inter', -apple-system, 'Segoe UI', system-ui, sans-serif";

export const tokenSets: DesignTokens[] = [
  {
    // Blackout Crimson — the flagship look: near-black with a single blood-red accent.
    "--color-bg": "#0A0A0A",
    "--color-surface": "#151515",
    "--color-text": "#F4F2ED",
    "--color-text-muted": "#9B9691",
    "--color-primary": "#E8283F",
    "--color-primary-contrast": "#0A0A0A",
    "--color-accent": "#E8283F",
    "--color-border": "#262626",
    "--font-heading": DISPLAY,
    "--font-body": BODY,
    "--radius-sm": "2px",
    "--radius-md": "4px",
    "--radius-lg": "6px",
    "--shadow-card": "0 8px 30px rgba(0,0,0,0.5)",
    "--shadow-elevated": "0 20px 60px rgba(0,0,0,0.65)",
  },
  {
    // Bone Noir — inverted editorial: warm off-white paper with ink-black type.
    "--color-bg": "#F1ECE2",
    "--color-surface": "#E6DFCF",
    "--color-text": "#161310",
    "--color-text-muted": "#6E665A",
    "--color-primary": "#161310",
    "--color-primary-contrast": "#F1ECE2",
    "--color-accent": "#A6702E",
    "--color-border": "#D7CDB6",
    "--font-heading": DISPLAY,
    "--font-body": BODY,
    "--radius-sm": "2px",
    "--radius-md": "4px",
    "--radius-lg": "6px",
    "--shadow-card": "0 8px 30px rgba(22,19,16,0.12)",
    "--shadow-elevated": "0 20px 50px rgba(22,19,16,0.18)",
  },
  {
    // Acid Static — black with a neon chartreuse jolt, streetwear/graffiti energy.
    "--color-bg": "#0D0D0D",
    "--color-surface": "#181818",
    "--color-text": "#F2F2ED",
    "--color-text-muted": "#8F8F89",
    "--color-primary": "#C8FF3D",
    "--color-primary-contrast": "#0D0D0D",
    "--color-accent": "#C8FF3D",
    "--color-border": "#282828",
    "--font-heading": DISPLAY,
    "--font-body": BODY,
    "--radius-sm": "2px",
    "--radius-md": "4px",
    "--radius-lg": "6px",
    "--shadow-card": "0 8px 30px rgba(0,0,0,0.5)",
    "--shadow-elevated": "0 20px 60px rgba(0,0,0,0.65)",
  },
];

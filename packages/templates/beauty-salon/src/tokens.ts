import type { DesignTokens } from "@sitegen/shared-ui/types.ts";

// L'ATELIER design language: editorial luxury.
// Display serif for headlines (Playfair Display), quiet geometric sans for UI (Manrope).
// Both families ship with full Cyrillic coverage and are loaded by the template's Base layout,
// so every palette below can reference them directly with safe system fallbacks.
const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const SANS = "'Manrope', -apple-system, 'Segoe UI', system-ui, sans-serif";

// Luxury reads as sharp, not bubbly: near-square corners everywhere.
const R_SM = "2px";
const R_MD = "4px";
const R_LG = "10px";

export const tokenSets: DesignTokens[] = [
  {
    // Ivory Atelier — warm ivory paper, bronze-gold accents. The flagship light look.
    "--color-bg": "#FAF8F3",
    "--color-surface": "#F1EBE0",
    "--color-text": "#211B14",
    "--color-text-muted": "#847A6A",
    "--color-primary": "#A8895C",
    "--color-primary-contrast": "#FFFFFF",
    "--color-accent": "#C7AE83",
    "--color-border": "#E5DECE",
    "--font-heading": SERIF,
    "--font-body": SANS,
    "--radius-sm": R_SM,
    "--radius-md": R_MD,
    "--radius-lg": R_LG,
    "--shadow-card": "0 1px 2px rgba(33,27,20,0.04), 0 14px 40px rgba(33,27,20,0.07)",
    "--shadow-elevated": "0 30px 70px rgba(33,27,20,0.16)",
  },
  {
    // Champagne Noir — after-dark flagship: charcoal room lit by champagne gold.
    "--color-bg": "#131110",
    "--color-surface": "#1D1A17",
    "--color-text": "#F4EEE2",
    "--color-text-muted": "#A79C89",
    "--color-primary": "#C8A96E",
    "--color-primary-contrast": "#171310",
    "--color-accent": "#E3D2AF",
    "--color-border": "#2D2822",
    "--font-heading": SERIF,
    "--font-body": SANS,
    "--radius-sm": R_SM,
    "--radius-md": R_MD,
    "--radius-lg": R_LG,
    "--shadow-card": "0 24px 60px rgba(0,0,0,0.45)",
    "--shadow-elevated": "0 34px 80px rgba(0,0,0,0.55)",
  },
  {
    // Blush Silk — powdery rose on porcelain, the softest of the six.
    "--color-bg": "#FBF7F4",
    "--color-surface": "#F3EAE5",
    "--color-text": "#33241F",
    "--color-text-muted": "#97827A",
    "--color-primary": "#B08578",
    "--color-primary-contrast": "#FFFFFF",
    "--color-accent": "#D4B4AB",
    "--color-border": "#EBDFD9",
    "--font-heading": SERIF,
    "--font-body": SANS,
    "--radius-sm": R_SM,
    "--radius-md": R_MD,
    "--radius-lg": R_LG,
    "--shadow-card": "0 1px 2px rgba(51,36,31,0.04), 0 14px 40px rgba(51,36,31,0.06)",
    "--shadow-elevated": "0 30px 70px rgba(51,36,31,0.13)",
  },
  {
    // Emerald Rituel — deep botanical green, spa-like and calm.
    "--color-bg": "#F7F6F0",
    "--color-surface": "#EAEEE5",
    "--color-text": "#1F2B22",
    "--color-text-muted": "#68796B",
    "--color-primary": "#2F5747",
    "--color-primary-contrast": "#F7F6F0",
    "--color-accent": "#9DB49B",
    "--color-border": "#DBE2D6",
    "--font-heading": SERIF,
    "--font-body": SANS,
    "--radius-sm": R_SM,
    "--radius-md": R_MD,
    "--radius-lg": R_LG,
    "--shadow-card": "0 1px 2px rgba(31,43,34,0.05), 0 14px 40px rgba(31,43,34,0.07)",
    "--shadow-elevated": "0 30px 70px rgba(31,43,34,0.15)",
  },
  {
    // Rose Noir — dark chocolate-plum walls with rose-gold light.
    "--color-bg": "#171113",
    "--color-surface": "#21181B",
    "--color-text": "#F4EAEA",
    "--color-text-muted": "#AC9599",
    "--color-primary": "#D0A0A6",
    "--color-primary-contrast": "#1A1114",
    "--color-accent": "#E6CBCF",
    "--color-border": "#34262A",
    "--font-heading": SERIF,
    "--font-body": SANS,
    "--radius-sm": R_SM,
    "--radius-md": R_MD,
    "--radius-lg": R_LG,
    "--shadow-card": "0 24px 60px rgba(0,0,0,0.45)",
    "--shadow-elevated": "0 34px 80px rgba(0,0,0,0.55)",
  },
  {
    // Graphite Couture — monochrome fashion-house minimalism, one gold accent line.
    "--color-bg": "#FFFFFF",
    "--color-surface": "#F5F5F2",
    "--color-text": "#17171A",
    "--color-text-muted": "#70707A",
    "--color-primary": "#17171A",
    "--color-primary-contrast": "#FFFFFF",
    "--color-accent": "#B99A5F",
    "--color-border": "#E7E7E3",
    "--font-heading": SERIF,
    "--font-body": SANS,
    "--radius-sm": R_SM,
    "--radius-md": R_MD,
    "--radius-lg": R_LG,
    "--shadow-card": "0 1px 2px rgba(23,23,26,0.05), 0 14px 40px rgba(23,23,26,0.07)",
    "--shadow-elevated": "0 30px 70px rgba(23,23,26,0.14)",
  },
];
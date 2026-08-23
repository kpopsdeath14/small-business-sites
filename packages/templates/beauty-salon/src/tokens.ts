import type { DesignTokens } from "@sitegen/shared-ui/types.ts";

// L'ATELIER design language: editorial luxury.
// Ten palettes, each with its own serif/sans pairing so sibling sites never read as
// recolors of one another. All families ship full Cyrillic coverage and are loaded
// by the template's Base layout; system fallbacks cover the pre-font flash.
const PLAYFAIR = "'Playfair Display', Georgia, 'Times New Roman', serif";
const CORMORANT = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const FORUM = "'Forum', Georgia, 'Times New Roman', serif";
const TENOR = "'Tenor Sans', 'Trebuchet MS', sans-serif";
const MANROPE = "'Manrope', -apple-system, 'Segoe UI', system-ui, sans-serif";
const JOST = "'Jost', 'Century Gothic', -apple-system, system-ui, sans-serif";

// Luxury reads as sharp, not bubbly — but each palette keeps its own corner personality:
// ateliers are near-square, spa looks soften a touch, couture goes razor-flat.
const R_SM = "2px";
const R_MD = "4px";
const R_LG = "10px";

export const tokenSets: DesignTokens[] = [
  {
    // 0 · Ivory Atelier — warm ivory paper, bronze-gold accents. The flagship light look.
    "--color-bg": "#FAF8F3",
    "--color-surface": "#F1EBE0",
    "--color-text": "#211B14",
    "--color-text-muted": "#847A6A",
    "--color-primary": "#A8895C",
    "--color-primary-contrast": "#FFFFFF",
    "--color-accent": "#C7AE83",
    "--color-border": "#E5DECE",
    "--font-heading": PLAYFAIR,
    "--font-body": MANROPE,
    "--radius-sm": R_SM,
    "--radius-md": R_MD,
    "--radius-lg": R_LG,
    "--shadow-card": "0 1px 2px rgba(33,27,20,0.04), 0 14px 40px rgba(33,27,20,0.07)",
    "--shadow-elevated": "0 30px 70px rgba(33,27,20,0.16)",
  },
  {
    // 1 · Champagne Noir — after-dark flagship: charcoal room lit by champagne gold.
    "--color-bg": "#131110",
    "--color-surface": "#1D1A17",
    "--color-text": "#F4EEE2",
    "--color-text-muted": "#A79C89",
    "--color-primary": "#C8A96E",
    "--color-primary-contrast": "#171310",
    "--color-accent": "#E3D2AF",
    "--color-border": "#2D2822",
    "--font-heading": PLAYFAIR,
    "--font-body": MANROPE,
    "--radius-sm": R_SM,
    "--radius-md": R_MD,
    "--radius-lg": R_LG,
    "--shadow-card": "0 24px 60px rgba(0,0,0,0.45)",
    "--shadow-elevated": "0 34px 80px rgba(0,0,0,0.55)",
  },
  {
    // 2 · Blush Silk — powdery rose on porcelain, delicate Cormorant italics.
    "--color-bg": "#FBF7F4",
    "--color-surface": "#F3EAE5",
    "--color-text": "#33241F",
    "--color-text-muted": "#97827A",
    "--color-primary": "#B08578",
    "--color-primary-contrast": "#FFFFFF",
    "--color-accent": "#D4B4AB",
    "--color-border": "#EBDFD9",
    "--font-heading": CORMORANT,
    "--font-body": MANROPE,
    "--radius-sm": "3px",
    "--radius-md": "6px",
    "--radius-lg": "14px",
    "--shadow-card": "0 1px 2px rgba(51,36,31,0.04), 0 14px 40px rgba(51,36,31,0.06)",
    "--shadow-elevated": "0 30px 70px rgba(51,36,31,0.13)",
  },
  {
    // 3 · Emerald Rituel — deep botanical green, spa-like calm with soft corners.
    "--color-bg": "#F7F6F0",
    "--color-surface": "#EAEEE5",
    "--color-text": "#1F2B22",
    "--color-text-muted": "#68796B",
    "--color-primary": "#2F5747",
    "--color-primary-contrast": "#F7F6F0",
    "--color-accent": "#9DB49B",
    "--color-border": "#DBE2D6",
    "--font-heading": CORMORANT,
    "--font-body": MANROPE,
    "--radius-sm": "3px",
    "--radius-md": "7px",
    "--radius-lg": "16px",
    "--shadow-card": "0 1px 2px rgba(31,43,34,0.05), 0 14px 40px rgba(31,43,34,0.07)",
    "--shadow-elevated": "0 30px 70px rgba(31,43,34,0.15)",
  },
  {
    // 4 · Rose Noir — dark chocolate-plum walls with rose-gold light.
    "--color-bg": "#171113",
    "--color-surface": "#21181B",
    "--color-text": "#F4EAEA",
    "--color-text-muted": "#AC9599",
    "--color-primary": "#D0A0A6",
    "--color-primary-contrast": "#1A1114",
    "--color-accent": "#E6CBCF",
    "--color-border": "#34262A",
    "--font-heading": PLAYFAIR,
    "--font-body": MANROPE,
    "--radius-sm": R_SM,
    "--radius-md": R_MD,
    "--radius-lg": R_LG,
    "--shadow-card": "0 24px 60px rgba(0,0,0,0.45)",
    "--shadow-elevated": "0 34px 80px rgba(0,0,0,0.55)",
  },
  {
    // 5 · Graphite Couture — monochrome fashion-house minimalism, one gold accent line.
    "--color-bg": "#FFFFFF",
    "--color-surface": "#F5F5F2",
    "--color-text": "#17171A",
    "--color-text-muted": "#70707A",
    "--color-primary": "#17171A",
    "--color-primary-contrast": "#FFFFFF",
    "--color-accent": "#B99A5F",
    "--color-border": "#E7E7E3",
    "--font-heading": PLAYFAIR,
    "--font-body": MANROPE,
    "--radius-sm": "0px",
    "--radius-md": "0px",
    "--radius-lg": "2px",
    "--shadow-card": "0 1px 0 rgba(23,23,26,0.06), 0 18px 44px rgba(23,23,26,0.08)",
    "--shadow-elevated": "0 30px 70px rgba(23,23,26,0.16)",
  },
  {
    // 6 · Sapphire Éclat — midnight navy lit by platinum; Jost's geometric capitals.
    "--color-bg": "#0E1420",
    "--color-surface": "#16202F",
    "--color-text": "#EDF1F7",
    "--color-text-muted": "#93A1B5",
    "--color-primary": "#AFC3DC",
    "--color-primary-contrast": "#101826",
    "--color-accent": "#D8E2EF",
    "--color-border": "#223046",
    "--font-heading": CORMORANT,
    "--font-body": JOST,
    "--radius-sm": R_SM,
    "--radius-md": R_MD,
    "--radius-lg": R_LG,
    "--shadow-card": "0 24px 60px rgba(0,0,0,0.5)",
    "--shadow-elevated": "0 34px 80px rgba(0,0,0,0.6)",
  },
  {
    // 7 · Terracotta Sole — sun-baked terracotta on warm cream; Forum's Roman calm.
    "--color-bg": "#FBF5EC",
    "--color-surface": "#F4E7D7",
    "--color-text": "#33221A",
    "--color-text-muted": "#8A7362",
    "--color-primary": "#B4643C",
    "--color-primary-contrast": "#FFF8EF",
    "--color-accent": "#DDAF87",
    "--color-border": "#EBDCC8",
    "--font-heading": FORUM,
    "--font-body": MANROPE,
    "--radius-sm": "3px",
    "--radius-md": "6px",
    "--radius-lg": "12px",
    "--shadow-card": "0 1px 2px rgba(51,34,26,0.05), 0 14px 40px rgba(51,34,26,0.07)",
    "--shadow-elevated": "0 30px 70px rgba(51,34,26,0.15)",
  },
  {
    // 8 · Cacao Noir — deep espresso walls warmed by bronze light; Playfair + Jost.
    "--color-bg": "#171210",
    "--color-surface": "#221B16",
    "--color-text": "#F3EDE6",
    "--color-text-muted": "#A89A8C",
    "--color-primary": "#C9A87E",
    "--color-primary-contrast": "#191310",
    "--color-accent": "#E2CDB2",
    "--color-border": "#332A22",
    "--font-heading": PLAYFAIR,
    "--font-body": JOST,
    "--radius-sm": R_SM,
    "--radius-md": R_MD,
    "--radius-lg": R_LG,
    "--shadow-card": "0 24px 60px rgba(0,0,0,0.45)",
    "--shadow-elevated": "0 34px 80px rgba(0,0,0,0.55)",
  },
  {
    // 9 · Porcelain Bleu — icy porcelain blue-grey, clinical chic; Tenor Sans display.
    "--color-bg": "#F6F8FA",
    "--color-surface": "#EAEFF3",
    "--color-text": "#1C2530",
    "--color-text-muted": "#66758A",
    "--color-primary": "#33506B",
    "--color-primary-contrast": "#F6F8FA",
    "--color-accent": "#9FB4C8",
    "--color-border": "#DAE2EA",
    "--font-heading": TENOR,
    "--font-body": MANROPE,
    "--radius-sm": "0px",
    "--radius-md": "2px",
    "--radius-lg": "6px",
    "--shadow-card": "0 1px 2px rgba(28,37,48,0.05), 0 14px 40px rgba(28,37,48,0.07)",
    "--shadow-elevated": "0 30px 70px rgba(28,37,48,0.14)",
  },
];
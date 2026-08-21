import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import tailwind from "@astrojs/tailwind";

// GitHub Pages project site: https://kpopsdeath14.github.io/small-business-sites/
// `base` prefixes Astro's own asset URLs; photo paths inside src/data/site.json
// carry the same prefix (written by the CLI --base step / deploy prep).
export default defineConfig({
  site: "https://kpopsdeath14.github.io",
  base: "/small-business-sites",
  integrations: [preact(), tailwind({ applyBaseStyles: false })],
});
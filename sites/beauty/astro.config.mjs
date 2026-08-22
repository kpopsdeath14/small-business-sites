import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  // GitHub Pages project site — written by the CLI from --base; edit freely for custom domains.
  site: "https://kpopsdeath14.github.io",
  base: "/small-business-sites/beauty-salon",
  integrations: [preact(), tailwind({ applyBaseStyles: false })],
});

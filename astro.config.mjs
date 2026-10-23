// @ts-check
import { defineConfig } from 'astro/config';

// The site is served from https://andrew28kg.github.io/philpanicio/
// If you rename the repo, change `base` to match the new repo name.
export default defineConfig({
  site: 'https://andrew28kg.github.io',
  base: '/philpanicio',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    // Keep page CSS in a cached file instead of inlining it in every page.
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      // Never publish source maps.
      sourcemap: false,
    },
  },
});

import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    target: "es2022",
    cssCodeSplit: false,
    sourcemap: false,
    assetsInlineLimit: 4096,
  },
});

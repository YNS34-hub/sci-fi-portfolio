import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist/client",
    target: "es2022",
    cssCodeSplit: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("three")) return "three";
          if (id.includes("gsap")) return "motion";
          if (id.includes("react")) return "react";
        },
      },
    },
  },
});

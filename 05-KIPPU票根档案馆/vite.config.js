import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

function sitesStaticOutput() {
  return {
    name: "sites-static-output",
    apply: "build",
    async closeBundle() {
      await mkdir(resolve("dist", "server"), { recursive: true });
      await copyFile(resolve("worker", "index.js"), resolve("dist", "server", "index.js"));
    },
  };
}

export default defineConfig({
  plugins: [react(), sitesStaticOutput()],
});

import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        manualChunks(id: string) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("/react/") || id.includes("/react-dom/")) {
            return "react";
          }

          if (
            id.includes("/@emotion/") ||
            id.includes("/@mui/icons-material/") ||
            id.includes("/@mui/material/")
          ) {
            return "mui";
          }

          if (id.includes("/react-markdown/")) {
            return "markdown";
          }
        },
      },
    },
  },
  test: {
    clearMocks: true,
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      reporter: ["text", "html"],
    },
    environment: "jsdom",
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e-tests/**"],
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});

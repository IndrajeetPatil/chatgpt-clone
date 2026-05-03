import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const VENDOR_CHUNKS: [string, string][] = [
  ["react", "/react/"],
  ["react", "/react-dom/"],
  ["mui", "/@emotion/"],
  ["mui", "/@mui/icons-material/"],
  ["mui", "/@mui/material/"],
  ["markdown", "/react-markdown/"],
];

export default defineConfig({
  plugins: [react()],
  publicDir: "app/favicon",
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
          return VENDOR_CHUNKS.find(([, pattern]) => id.includes(pattern))?.[0];
        },
      },
    },
  },
  test: {
    clearMocks: true,
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      reporter: ["text", "html", "lcov"],
      thresholds: {
        statements: 90,
        branches: 75,
        functions: 90,
        lines: 90,
      },
    },
    environment: "jsdom",
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e-tests/**"],
    globals: true,
    pool: "threads",
    setupFiles: ["./vitest.setup.ts"],
  },
});

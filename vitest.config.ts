/// <reference types="vitest" />
// Define __dirname in ESM
const __dirname = new URL(".", import.meta.url).pathname;

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["__tests__/setup.ts"],
    globals: true,
    include: ["**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
      react: resolve(__dirname, "node_modules/react"),
      "react-dom": resolve(__dirname, "node_modules/react-dom"),
      "react/jsx-dev-runtime": resolve(
        __dirname,
        "node_modules/react/jsx-dev-runtime"
      ),
    },
    dedupe: ["react", "react-dom"],
  },
});

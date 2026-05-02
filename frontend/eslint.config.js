import globals from "globals";
import noUnsanitized from "eslint-plugin-no-unsanitized";
import reactPlugin from "eslint-plugin-react";
import tsParser from "@typescript-eslint/parser";

/**
 * Security-focused ESLint config.
 * Biome handles general style/quality rules; this config targets only patterns
 * that carry a security risk (XSS, code injection, unsafe DOM manipulation).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "node_modules/**",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "e2e-tests/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      react: reactPlugin,
      "no-unsanitized": noUnsanitized,
    },
    rules: {
      // Prevent XSS via React's dangerouslySetInnerHTML escape hatch
      "react/no-danger": "error",
      "react/no-danger-with-children": "error",

      // Prevent XSS via direct DOM manipulation (innerHTML, insertAdjacentHTML, …)
      "no-unsanitized/method": "error",
      "no-unsanitized/property": "error",

      // Prevent arbitrary code execution
      "no-eval": "error",
      "no-new-func": "error",
      "no-implied-eval": "error",
    },
  },
];

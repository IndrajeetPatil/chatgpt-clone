import tsParser from "@typescript-eslint/parser";
import noUnsanitized from "eslint-plugin-no-unsanitized";
import reactDom from "eslint-plugin-react-dom";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

// The React Compiler auto-memoizes components, but it silently bails out on any
// component or hook that breaks the Rules of React (mutating props/state during
// render, reading refs in render, impure logic, etc.). These rules — shipped
// with the compiler in eslint-plugin-react-hooks — surface those bail-outs at
// lint time so a component keeps getting compiled. `rules-of-hooks` and
// `exhaustive-deps` are omitted because Biome's recommended preset already
// enforces the equivalent `useHookAtTopLevel` / `useExhaustiveDependencies`.
const reactCompilerRules = {
  ...reactHooks.configs["recommended-latest"].rules,
  "react-hooks/rules-of-hooks": "off",
  "react-hooks/exhaustive-deps": "off",
};

/**
 * Security-focused ESLint config, plus React Compiler health checks.
 * Biome handles general style/quality rules; this config targets patterns that
 * carry a security risk (XSS, code injection, unsafe DOM manipulation) and
 * patterns that would make the React Compiler bail out of optimizing a
 * component.
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
      "no-unsanitized": noUnsanitized,
      "react-dom": reactDom,
      "react-hooks": reactHooks,
    },
    rules: {
      // React Compiler bail-out detection (see reactCompilerRules above).
      ...reactCompilerRules,

      // Prevent XSS via React DOM escape hatches and dangerous URL patterns
      "react-dom/no-dangerously-set-innerhtml": "error",
      "react-dom/no-dangerously-set-innerhtml-with-children": "error",
      "react-dom/no-script-url": "error",
      "react-dom/no-unsafe-iframe-sandbox": "error",
      "react-dom/no-unsafe-target-blank": "error",

      // Catch dangerouslySetInnerHTML keys hidden inside spread props
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "ObjectExpression > Property[key.name='dangerouslySetInnerHTML']",
          message: "Do not create React dangerouslySetInnerHTML props.",
        },
        {
          selector:
            "ObjectExpression > Property[key.value='dangerouslySetInnerHTML']",
          message: "Do not use React dangerouslySetInnerHTML.",
        },
      ],

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

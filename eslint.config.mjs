import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["js/**/*.{js,ts}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "script",
        project: false,
      },
      globals: {
        document: "readonly",
        window: "readonly",
        console: "readonly",
        requestAnimationFrame: "readonly",
        THREE: "readonly",
        Math: "readonly",
        Date: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        IntersectionObserver: "readonly",
        HTMLElement: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      // === Backpressure: prevent bad code from entering ===
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-var": "error",
      "prefer-const": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-debugger": "error",
      "no-alert": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always"],
      curly: ["error", "multi-line"],
      "no-throw-literal": "error",
      "no-self-compare": "error",
      "no-duplicate-imports": "error",

      // === Code quality: TypeScript-aware rules ===
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-definitions": ["warn", "interface"],
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-duplicate-enum-values": "error",

      // === Safety nets ===
      "no-implicit-globals": "off",
      "no-shadow": "warn",
      "no-param-reassign": "warn",
      "no-nested-ternary": "warn",
      "max-depth": ["warn", 4],
      complexity: ["warn", 15],
      "max-lines-per-function": ["warn", { max: 80, skipBlankLines: true, skipComments: true }],
    },
  },
];

// ESLint (flat config, ESLint 9)
// ------------------------------
// Avval package.json dagi "lint" skripti shunchaki echo edi — ya'ni lint
// hech qachon ishlamagan, garchi kodda eslint-disable izohlari bo'lsa ham.
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "prisma/migrations/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // ecosystem.config.js — PM2 konfiguratsiyasi, CommonJS formatida
    files: ["**/*.config.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { module: "writable", require: "readonly", process: "readonly" },
    },
  },
  {
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        fetch: "readonly",
        __dirname: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // `any` kodda ataylab ishlatilgan joylar bor (Prisma delegate'lari
      // turli tiplarda bo'lgani uchun) — ular eslint-disable bilan
      // belgilangan, shuning uchun qoida "warn" darajasida qoladi.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  }
);

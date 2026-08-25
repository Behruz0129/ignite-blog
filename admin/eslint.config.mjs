// ESLint (flat config, ESLint 9)
// ------------------------------
// Avval `next lint` skripti bor edi-yu, konfiguratsiya fayli yo'q edi —
// ya'ni lint amalda hech qachon ishlamagan.
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Ishlatilmayotgan o'zgaruvchilar — xato, lekin "_" bilan
      // boshlanganlari ataylab e'tiborsiz qoldirilgan deb hisoblanadi
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // O'CHIRILGAN: react/no-unescaped-entities
      // Bu qoida JSX matnidagi ' " > } belgilarini HTML entity'ga
      // o'girishni talab qiladi. Zamonaviy React'da bu xavfsizlik masalasi
      // emas — JSX matn tugunlarini avtomatik escape qiladi. Bizning
      // interfeys esa o'zbekcha va deyarli har ikkinchi so'zda apostrof bor
      // ("qo'llanma", "o'chirish", "yo'q"). Ularning barchasini &apos; ga
      // aylantirish manba matnini o'qib bo'lmas holga keltirardi.
      "react/no-unescaped-entities": "off",
    },
  },
];

export default config;

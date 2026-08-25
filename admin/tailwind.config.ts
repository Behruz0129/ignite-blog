import type { Config } from "tailwindcss";

/**
 * ADMIN DIZAYN TOKENLARI
 * ----------------------
 * Ommaviy sayt bilan bir oilada: neytral kulranglar + bitta urg'u rangi.
 * Ranglar to'g'ridan-to'g'ri emas, shu nomlar orqali ishlatiladi — keyin
 * bitta joydan o'zgartirish mumkin.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Ish maydoni foni va kartochkalar
        canvas: "#f7f7f8",
        paper: "#ffffff",

        // Yon panel (quyuq rels)
        rail: {
          DEFAULT: "#141416",
          soft: "#1d1d21",
          line: "#2a2a30",
        },

        // Matn ierarxiyasi
        ink: {
          DEFAULT: "#18181b",
          soft: "#5f5f6b",
          faint: "#9a9aa5",
        },

        // Chegaralar
        line: {
          DEFAULT: "#e7e7ea",
          strong: "#d6d6dc",
        },

        // Urg'u
        brand: {
          DEFAULT: "#6d3ce6",
          dark: "#5a2dc9",
          soft: "#f2eeff",
          line: "#d9ccff",
        },

        // Holat ranglari
        ok: { DEFAULT: "#0f7b49", soft: "#e7f6ef" },
        warn: { DEFAULT: "#a15c00", soft: "#fdf1dd" },
        danger: { DEFAULT: "#b42318", soft: "#fdeceb" },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,16,20,0.04), 0 1px 3px rgba(16,16,20,0.03)",
        pop: "0 8px 30px -8px rgba(16,16,20,0.18), 0 2px 8px rgba(16,16,20,0.06)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      keyframes: {
        "pop-in": {
          "0%": { opacity: "0", transform: "translateY(4px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.12s ease-out both",
        "toast-in": "toast-in 0.18s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;

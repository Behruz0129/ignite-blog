import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Apple uslubidagi neytral palitra (asosan oq-qora)
        ink: {
          DEFAULT: "#1d1d1f", // deyarli qora (Apple matn rangi)
          soft: "#6e6e73", // ikkilamchi kulrang matn
        },
        paper: "#ffffff",
        haze: "#f5f5f7", // Apple ochiq kulrang fon
        line: "#d2d2d7", // nozik chegara
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      maxWidth: {
        content: "1120px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#7c3aed", // binafsha (gaming hissi)
          dark: "#6d28d9",
          light: "#a78bfa",
        },
      },
    },
  },
  plugins: [],
};

export default config;

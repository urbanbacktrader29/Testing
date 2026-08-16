import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#05070d",
          900: "#0a0e17",
          800: "#101623",
          700: "#182034",
          600: "#232d47",
        },
        accent: {
          400: "#3ee08a",
          500: "#22c55e",
          600: "#16a34a",
        },
        gold: {
          400: "#f5c453",
          500: "#e8ab1f",
        },
        danger: {
          400: "#f87171",
          500: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "grid-glow":
          "radial-gradient(circle at 20% 20%, rgba(34,197,94,0.15), transparent 40%), radial-gradient(circle at 80% 0%, rgba(232,171,31,0.12), transparent 40%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        ticker: "ticker 30s linear infinite",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

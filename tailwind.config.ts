import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        studio: {
          950: "#090A0F",
          900: "#11131F",
          850: "#16192B",
          800: "#1D2138",
          700: "#2B3152",
          600: "#3D4675",
          500: "#5865A8",
          400: "#7E8CD4",
          300: "#A8B4EB",
          200: "#D0D7F7",
          100: "#EBEFFA",
          50: "#F5F7FD",
        },
        gold: {
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
        },
        slateCustom: {
          950: "#0A0D14",
          900: "#101420",
          800: "#1E2438",
        }
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

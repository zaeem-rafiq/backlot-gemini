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
          950: "#08090D",
          900: "#0F121A",
          850: "#151924",
          800: "#1E2438",
          700: "#2D374D",
          600: "#3E4C6D",
          500: "#5A6D96",
          400: "#7A88A1",
          300: "#94A3B8",
          200: "#CBD5E1",
          100: "#E2E8F0",
          50: "#F8FAFC",
        },
        filmAmber: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
        },
        stripboard: {
          dayInt: "#F1F5F9",
          dayIntText: "#0F172A",
          dayIntBorder: "#CBD5E1",
          dayExt: "#FEF08A",
          dayExtText: "#713F12",
          dayExtBorder: "#FACC15",
          nightInt: "#BAE6FD",
          nightIntText: "#0C4A6E",
          nightIntBorder: "#7DD3FC",
          nightExt: "#BBF7D0",
          nightExtText: "#14532D",
          nightExtBorder: "#86EFAC",
          dayBreak: "#1E293B",
          dayBreakText: "#F8FAFC",
        },
      },
      fontFamily: {
        screenplay: ["'Courier Prime'", "'Courier New'", "Courier", "monospace"],
        editorial: ["'Instrument Serif'", "'Newsreader'", "'Playfair Display'", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "'SF Mono'", "Menlo", "Monaco", "Consolas", "monospace"],
        sans: ["'Inter'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

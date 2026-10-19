import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Newsreader", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        paper: {
          50: "#FAF9F5",
          100: "#F7F5F0",
          200: "#EFECE4",
          300: "#E3DED2",
          400: "#D4CCBF",
        },
        obsidian: {
          750: "#27272B",
          800: "#212124",
          850: "#1A1A1D",
          900: "#141416",
          950: "#0F0F10",
        },
        amber: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          850: "#78350F",
          900: "#78350F",
          950: "#451A03",
        },
        terracotta: {
          50: "#FCF5F3",
          100: "#F8E5DF",
          200: "#EFC8BC",
          500: "#D9795E",
          600: "#C86D51",
          700: "#A85339",
          800: "#863C26",
        },
        charcoal: {
          600: "#52525B",
          700: "#3F3F46",
          800: "#27272A",
          900: "#18181B",
          950: "#0F0F11",
        },
        sand: {
          50: "#FDFCF9",
          100: "#F9F8F3",
          200: "#EFECE4",
          300: "#E1DBD0",
          400: "#C7BDAA",
          500: "#A89C86",
        },
      },
      boxShadow: {
        'book': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 25px -3px rgba(0, 0, 0, 0.08), inset -2px 0 4px rgba(0, 0, 0, 0.04)',
        'book-hover': '0 12px 24px -4px rgba(0, 0, 0, 0.1), 0 25px 35px -4px rgba(0, 0, 0, 0.12), inset -2px 0 4px rgba(0, 0, 0, 0.05)',
        'editorial': '0 20px 40px -15px rgba(0, 0, 0, 0.07)',
        'tactile': '0 1px 3px rgba(0, 0, 0, 0.04), 0 6px 16px rgba(0, 0, 0, 0.06)',
        'fab': '0 16px 32px -8px rgba(24, 24, 27, 0.25)',
      },
      letterSpacing: {
        'micro': '0.15em',
        'editorial': '0.18em',
        'subtle': '-0.02em',
        'tight-heading': '-0.025em',
      }
    },
  },
  plugins: [],
};
export default config;

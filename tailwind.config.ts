import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Himalayan Dawn & Deep Teal Palette
        travertine: {
          DEFAULT: "#F9F7F6",
          soft: "#F7F3EA",
          linen: "#EAE3D5",
          dark: "#D8CEBC",
        },
        espresso: {
          DEFAULT: "#12313A",
          muted: "#445A62",
          subtle: "#5D7279",
        },
        terracotta: {
          DEFAULT: "#12313A",
          hover: "#0D252C",
          bright: "#D6A15D",
          light: "#FBF5EB",
        },
        sandstone: {
          DEFAULT: "#D8CEBC",
          light: "#E5DEC9",
          dark: "#8C6226",
          muted: "rgba(216, 206, 188, 0.25)",
        },
        saffron: {
          DEFAULT: "#D6A15D",
          light: "#E4BA82",
          dark: "#9A6B29",
          muted: "rgba(214, 161, 93, 0.14)",
        },
        forest: {
          DEFAULT: "#1B4B52",
          light: "#EBF4F4",
          dark: "#12313A",
          muted: "rgba(18, 49, 58, 0.12)",
        },

        // Semantic Tokens
        background: "#F9F7F6",
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F7F3EA",
          elevated: "#FDFCFA",
          sandstone: "#F7F3EA",
          ivory: "#F9F7F6",
          dark: "#12313A",
          muted: "#EDE7DA",
        },
        primary: {
          DEFAULT: "#D6A15D",
          light: "#E4BA82",
          dark: "#B4803D",
        },
        accent: {
          saffron: "#D6A15D",
          "saffron-dark": "#8C6226",
          green: "#1B4B52",
          sandstone: "#D8CEBC",
        },
        text: {
          DEFAULT: "#12313A",
          muted: "#445A62",
          dark: "#12313A",
          sandstone: "#8C6226",
          saffron: "#8C6226",
        },
        border: "rgba(216, 206, 188, 0.7)",
        road: {
          surface: "#12313A",
          stripe: "#D6A15D",
          curb: "#D8CEBC",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

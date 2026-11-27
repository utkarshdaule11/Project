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
        // Raw Palette
        navy: {
          DEFAULT: "#091522",
          dark: "#050C14",
          light: "#0E1E30",
        },
        charcoal: {
          DEFAULT: "#101F2E",
          dark: "#0C1722",
          light: "#182C40",
        },
        sandstone: {
          DEFAULT: "#D9B88F",
          light: "#EAD7BF",
          dark: "#B89366",
          muted: "rgba(217, 184, 143, 0.15)",
        },
        saffron: {
          DEFAULT: "#E9A15C",
          light: "#F2BC85",
          dark: "#D48439",
          muted: "rgba(233, 161, 92, 0.15)",
        },
        ivory: {
          DEFAULT: "#F2EBDD",
          light: "#FAF6F0",
          dark: "#DDD1BC",
          muted: "rgba(242, 235, 221, 0.7)",
        },
        forest: {
          DEFAULT: "#294A3B",
          light: "#3D6854",
          dark: "#1A3328",
          muted: "rgba(41, 74, 59, 0.2)",
        },

        // Semantic Tokens
        background: "#091522",
        surface: {
          DEFAULT: "#101F2E",
          subtle: "#142638",
          elevated: "#192F45",
          sandstone: "#D9B88F",
          ivory: "#F2EBDD",
          dark: "#091522",
          muted: "#1D354D",
        },
        primary: {
          DEFAULT: "#E9A15C",
          light: "#F2BC85",
          dark: "#D48439",
        },
        accent: {
          saffron: "#E9A15C",
          "saffron-dark": "#D48439",
          green: "#294A3B",
          sandstone: "#D9B88F",
        },
        text: {
          DEFAULT: "#F2EBDD",
          muted: "#A2B3C4",
          dark: "#091522",
          sandstone: "#D9B88F",
          saffron: "#E9A15C",
        },
        border: "rgba(217, 184, 143, 0.2)",
        road: {
          surface: "#101F2E",
          stripe: "#E9A15C",
          curb: "#D9B88F",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

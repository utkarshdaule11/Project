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
        background: "#E6F4FA",
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F2F9FD",
          primary: "#E0F2FE",
          secondary: "#F0F9FF",
          accent: "#38BDF8",
          dark: "#0F172A",
          muted: "#64748B",
        },
        primary: {
          DEFAULT: "#1CA7B8",
          light: "#5CC8D7",
          dark: "#0E7A88",
        },
        accent: {
          saffron: "#F59A4B",
          "saffron-dark": "#C8681A",
          green: "#3E9B6A",
        },
        text: {
          DEFAULT: "#1F3A6B",
          muted: "#476685",
        },
        border: "rgba(28, 167, 184, 0.2)",
        flag: {
          saffron: "#FF9933",
          white: "#FFFFFF",
          green: "#138808",
          navy: "#000080",
        },
        tint: {
          saffron: "#FFF5EB",
          green: "#F0FDF4",
        },
        road: {
          surface: "#334155",
          stripe: "#FACC15",
          curb: "#94A3B8",
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

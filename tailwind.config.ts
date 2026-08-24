import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0E14",
          surface: "#121822",
          raised: "#1A222E",
          line: "#232D3A",
        },
        signal: {
          DEFAULT: "#FDB022",
          soft: "#FFD180",
        },
        circuit: {
          DEFAULT: "#34D9C5",
        },
        ok: "#34D399",
        full: "#F87171",
        paper: "#E8ECEF",
        muted: "#7C8896",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        grid: "linear-gradient(#1A222E 1px, transparent 1px), linear-gradient(90deg, #1A222E 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
        flicker: {
          "0%,100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.6" },
          "94%": { opacity: "1" },
        },
      },
      animation: {
        blink: "blink 1.4s ease-in-out infinite",
        flicker: "flicker 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

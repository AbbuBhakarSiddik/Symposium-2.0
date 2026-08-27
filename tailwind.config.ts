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
        cyber: {
          cyan: "#00F0FF",
          magenta: "#FF00E5",
          purple: "#7B2FBE",
        },
        ok: "#34D399",
        full: "#F87171",
        warning: "#FBBF24",
        paper: "#E8ECEF",
        muted: "#9CA3AF",
        glass: "rgba(255, 255, 255, 0.04)",
        "glass-border": "rgba(255, 255, 255, 0.08)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "cyber-grid": `
          linear-gradient(to right, rgba(0, 240, 255, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 240, 255, 0.05) 1px, transparent 1px),
          linear-gradient(135deg, rgba(255, 0, 229, 0.03) 1px, transparent 1px)
        `,
        "cyber-gradient": "radial-gradient(circle at 30% 30%, rgba(0, 240, 255, 0.15), rgba(123, 47, 190, 0.10) 50%, transparent 80%)",
        "glow-orb": "radial-gradient(circle, rgba(255, 176, 34, 0.2), transparent 70%)",
      },
      backgroundSize: {
        grid: "60px 60px, 60px 60px, 40px 40px",
      },
      boxShadow: {
        glow: "0 0 30px rgba(253, 176, 34, 0.2)",
        "glow-teal": "0 0 30px rgba(52, 217, 197, 0.2)",
        "glow-cyan": "0 0 30px rgba(0, 240, 255, 0.2)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.5)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "grid-pulse": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.8" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        scanline: "scanline 8s linear infinite",
        "grid-pulse": "grid-pulse 4s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "fade-up": "fade-up 0.8s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
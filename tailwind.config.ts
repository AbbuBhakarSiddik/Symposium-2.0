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
          DEFAULT: "#FAF9F5",
          surface: "#FFFFFF",
          raised: "#F3F2EC",
          line: "#E2E8F0",
        },
        signal: {
          DEFAULT: "#D97706",
          soft: "#F59E0B",
        },
        circuit: {
          DEFAULT: "#0EA5E9",
        },
        cyber: {
          cyan: "#0EA5E9",
          magenta: "#EC4899",
          purple: "#6366F1",
        },
        ok: "#10B981",
        full: "#EF4444",
        warning: "#F59E0B",
        paper: "#0F172A",
        muted: "#64748B",
        glass: "rgba(255, 255, 255, 0.85)",
        "glass-border": "rgba(15, 23, 42, 0.08)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "cyber-grid": `
          linear-gradient(to right, rgba(14, 165, 233, 0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(14, 165, 233, 0.04) 1px, transparent 1px)
        `,
        "cyber-gradient": "radial-gradient(circle at 30% 30%, rgba(14, 165, 233, 0.08), rgba(99, 102, 241, 0.06) 50%, transparent 80%)",
        "glow-orb": "radial-gradient(circle, rgba(14, 165, 233, 0.12), transparent 70%)",
      },
      backgroundSize: {
        grid: "60px 60px, 60px 60px",
      },
      boxShadow: {
        glow: "0 10px 30px rgba(14, 165, 233, 0.15)",
        "glow-teal": "0 10px 30px rgba(20, 184, 166, 0.15)",
        "glow-cyan": "0 10px 30px rgba(14, 165, 233, 0.2)",
        glass: "0 20px 40px -15px rgba(15, 23, 42, 0.07), 0 0 1px rgba(15, 23, 42, 0.12)",
        depth: "0 25px 50px -12px rgba(15, 23, 42, 0.08), 0 0 1px rgba(15, 23, 42, 0.15)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-15px)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "grid-pulse": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.7" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(25px)" },
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
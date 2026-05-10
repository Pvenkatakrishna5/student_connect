import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ["var(--font-syne)", "sans-serif"],
        dm: ["var(--font-dm-sans)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      colors: {
        bg: {
          primary: "#0A0A0F",
          secondary: "#13131A",
          tertiary: "#1C1C28",
        },
        accent: {
          DEFAULT: "#6C63FF",
          hover: "#5A52E8",
          muted: "rgba(108,99,255,0.1)",
        },
        mint: {
          DEFAULT: "#00D9A3",
          hover: "#00C293",
          muted: "rgba(0,217,163,0.1)",
        },
        danger: {
          DEFAULT: "#FF4D6D",
          muted: "rgba(255,77,109,0.1)",
        },
        warning: {
          DEFAULT: "#FFB547",
          muted: "rgba(255,181,71,0.1)",
        },
        text: {
          primary: "#F0F0FF",
          secondary: "#8B8BA8",
          disabled: "#4A4A6A",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.06)",
          muted: "rgba(255,255,255,0.03)",
          accent: "rgba(108,99,255,0.3)",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        shimmer: "shimmer 1.5s infinite",
        marquee: "marquee 30s linear infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(108,99,255,0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(108,99,255,0.5)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      backdropBlur: { xs: "2px" },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;

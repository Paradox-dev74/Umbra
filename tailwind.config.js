/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        umbra: {
          bg: "#010409",
          card: "#060B14",
          elevated: "#0C1424",
          cyan: "#22D3EE",
          "cyan-dim": "#0891B2",
          blue: "#3B82F6",
          "blue-light": "#60A5FA",
          violet: "#A78BFA",
          "violet-dim": "#7C3AED",
          border: "rgba(255,255,255,0.06)",
          muted: "#8B9CB8",
          success: "#34D399",
          warning: "#FBBF24",
          danger: "#F87171",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        "cyan-glow": "0 0 80px rgba(34,211,238,0.2)",
        "cyan-glow-sm": "0 0 30px rgba(34,211,238,0.15)",
        "blue-glow": "0 0 80px rgba(59,130,246,0.25)",
        "blue-glow-sm": "0 0 30px rgba(59,130,246,0.15)",
        "violet-glow": "0 0 60px rgba(167,139,250,0.25)",
        "card-dark": "0 4px 32px rgba(0,0,0,0.5)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      animation: {
        "orb-pulse": "orb-pulse 4s ease-in-out infinite",
        "orbit-1": "spin 30s linear infinite",
        "orbit-2": "spin 20s linear infinite reverse",
        "orbit-3": "spin 15s linear infinite",
        "dot-travel": "dot-travel 2.5s linear infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
        "encrypt-shimmer": "encrypt-shimmer 2.5s ease-in-out infinite",
        "count-up": "count-up 2s ease-out forwards",
        ticker: "ticker 30s linear infinite",
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
        "gradient-rotate": "gradient-rotate 120s linear infinite",
        "chevron-bounce": "chevron-bounce 2s ease-in-out infinite",
        "mesh-drift": "mesh-drift 20s ease-in-out infinite",
        "float-y": "float-y 4s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        "orb-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.04)", opacity: "0.92" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "encrypt-shimmer": {
          "0%, 100%": { backgroundPosition: "200% 0" },
          "50%": { backgroundPosition: "-200% 0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "dot-travel": {
          "0%": { offsetDistance: "0%" },
          "100%": { offsetDistance: "100%" },
        },
        "pulse-ring": {
          "0%, 100%": { boxShadow: "0 0 0px rgba(34,211,238,0.3)" },
          "50%": { boxShadow: "0 0 24px rgba(34,211,238,0.5)" },
        },
        "gradient-rotate": {
          "0%": { filter: "hue-rotate(0deg)" },
          "100%": { filter: "hue-rotate(8deg)" },
        },
        "chevron-bounce": {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.5" },
          "50%": { transform: "translateY(8px)", opacity: "1" },
        },
        "mesh-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(2%, -1%) scale(1.02)" },
          "66%": { transform: "translate(-1%, 2%) scale(0.98)" },
        },
        "float-y": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      clipPath: {
        "slant-top": "polygon(0 8%, 100% 0, 100% 100%, 0 100%)",
        "slant-bottom": "polygon(0 0, 100% 0, 100% 92%, 0 100%)",
        "diamond": "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
      },
    },
  },
  plugins: [],
};

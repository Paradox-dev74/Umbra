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
          bg: "#020817",
          card: "#050D1A",
          elevated: "#0A1628",
          blue: "#3B82F6",
          "blue-light": "#60A5FA",
          violet: "#8B5CF6",
          border: "rgba(255,255,255,0.06)",
          muted: "#94A3B8",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        "blue-glow": "0 0 80px rgba(59,130,246,0.25)",
        "blue-glow-sm": "0 0 30px rgba(59,130,246,0.15)",
        "violet-glow": "0 0 60px rgba(139,92,246,0.20)",
        "card-dark": "0 4px 24px rgba(0,0,0,0.6)",
      },
      animation: {
        "orb-pulse": "orb-pulse 4s ease-in-out infinite",
        "orbit-1": "spin 30s linear infinite",
        "orbit-2": "spin 20s linear infinite reverse",
        "orbit-3": "spin 15s linear infinite",
        "dot-travel": "dot-travel 2.5s linear infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
        "encrypt-shimmer": "encrypt-shimmer 0.8s ease-out forwards",
        "count-up": "count-up 2s ease-out forwards",
        ticker: "ticker 30s linear infinite",
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
        "gradient-rotate": "gradient-rotate 120s linear infinite",
        "chevron-bounce": "chevron-bounce 2s ease-in-out infinite",
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
          "0%": { background: "transparent" },
          "30%": { background: "rgba(139,92,246,0.2)" },
          "100%": { background: "transparent" },
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
          "0%, 100%": { boxShadow: "0 0 0px rgba(59,130,246,0.4)" },
          "50%": { boxShadow: "0 0 20px rgba(59,130,246,0.6)" },
        },
        "gradient-rotate": {
          "0%": { filter: "hue-rotate(0deg)" },
          "100%": { filter: "hue-rotate(6deg)" },
        },
        "chevron-bounce": {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.5" },
          "50%": { transform: "translateY(8px)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

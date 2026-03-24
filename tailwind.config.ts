import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#52b4ff",
          foreground: "#000000",
          50: "#e6f7ff",
          100: "#bae7ff",
          200: "#91d5ff",
          300: "#69c0ff",
          400: "#52b4ff",
          500: "#52b4ff",
          600: "#1890ff",
          700: "#0050b3",
          800: "#003a8c",
          900: "#002766",
        },
        background: "#101010",
        foreground: "#f5f5f5",
        muted: {
          DEFAULT: "#1a1a1a",
          foreground: "#737373",
        },
        card: {
          DEFAULT: "#111111",
          foreground: "#f5f5f5",
        },
        border: "#2a2a2a",
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#1a1a1a",
          foreground: "#f5f5f5",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

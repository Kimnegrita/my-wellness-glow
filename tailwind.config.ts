import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(320 85% 62%)",
          light: "hsl(320 90% 72%)",
          darker: "hsl(320 75% 52%)",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        "background-light": "hsl(330 30% 98%)",
        "background-dark": "hsl(280 20% 10%)",
        surface: "hsl(0 0% 100%)",
        "surface-light": "hsl(330 25% 97%)",
        "surface-dark": "hsl(280 18% 14%)",
        "on-surface": "hsl(280 15% 20%)",
        "on-surface-dark": "hsl(330 15% 95%)",
        "on-surface-variant": "hsl(280 10% 50%)",
        "on-surface-variant-dark": "hsl(280 10% 68%)",
        "primary-container": "hsl(320 80% 95%)",
        "primary-container-dark": "hsl(320 75% 25%)",
        outline: "hsl(320 30% 92%)",
        "outline-dark": "hsl(280 15% 24%)",
        "rose-light": "hsl(340 85% 95%)",
        "rose-medium": "hsl(340 80% 75%)",
        "rose-dark": "hsl(340 70% 45%)",
        "lilac-light": "hsl(280 70% 95%)",
        "lilac-medium": "hsl(280 65% 75%)",
        "lilac-dark": "hsl(280 60% 45%)",
        "gold-light": "hsl(45 100% 95%)",
        "gold-medium": "hsl(45 95% 75%)",
        "gold-dark": "hsl(45 90% 50%)",
      },
      fontFamily: {
        display: ["Epilogue", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)" },
          "50%": { opacity: "0.8", boxShadow: "0 0 40px rgba(168, 85, 247, 0.6)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite"
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

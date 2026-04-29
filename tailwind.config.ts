import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./entities/**/*.{ts,tsx}",
    "./shared/**/*.{ts,tsx}",
    "./widgets/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
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
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
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
        yd: {
          bg: "var(--yd-bg)",
          surface: "var(--yd-surface)",
          elevated: "var(--yd-elevated)",
          overlay: "var(--yd-overlay)",
          line: {
            DEFAULT: "var(--yd-line)",
            strong: "var(--yd-line-strong)",
          },
          text: {
            DEFAULT: "var(--yd-text)",
            muted: "var(--yd-text-muted)",
            dim: "var(--yd-text-dim)",
            inverse: "var(--yd-text-inverse)",
          },
          primary: {
            DEFAULT: "var(--yd-primary)",
            hover: "var(--yd-primary-hover)",
            pressed: "var(--yd-primary-pressed)",
            subtle: "var(--yd-primary-subtle)",
            soft: "var(--yd-primary-soft)",
          },
          "on-primary": "var(--yd-on-primary)",
          success: {
            DEFAULT: "var(--yd-success)",
            hover: "var(--yd-success-hover)",
            subtle: "var(--yd-success-subtle)",
            soft: "var(--yd-success-soft)",
          },
          "on-success": "var(--yd-on-success)",
          warn: {
            DEFAULT: "var(--yd-warn)",
            hover: "var(--yd-warn-hover)",
            subtle: "var(--yd-warn-subtle)",
            soft: "var(--yd-warn-soft)",
          },
          "on-warn": "var(--yd-on-warn)",
          error: {
            DEFAULT: "var(--yd-error)",
            hover: "var(--yd-error-hover)",
            subtle: "var(--yd-error-subtle)",
            soft: "var(--yd-error-soft)",
          },
          "on-error": "var(--yd-on-error)",
          info: {
            DEFAULT: "var(--yd-info)",
            hover: "var(--yd-info-hover)",
            subtle: "var(--yd-info-subtle)",
            soft: "var(--yd-info-soft)",
          },
          "on-info": "var(--yd-on-info)",
          pr: {
            DEFAULT: "var(--yd-pr)",
            glow: "var(--yd-pr-glow)",
            subtle: "var(--yd-pr-subtle)",
            soft: "var(--yd-pr-soft)",
          },
          "on-pr": "var(--yd-on-pr)",
          rpe: {
            "6": "var(--yd-rpe-6)",
            "7": "var(--yd-rpe-7)",
            "8": "var(--yd-rpe-8)",
            "9": "var(--yd-rpe-9)",
            "10": "var(--yd-rpe-10)",
          },
          focus: "var(--yd-focus-ring)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050513",
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
        border: "hsl(var(--border))",
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
          DEFAULT: "#050513",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        gray: "#1F242F",
        blue: "#6033F5",
      },
      fontFamily: {
        inter: ["Inter"],
        manrope: ["Manrope"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      screens: {
        "custom-sm": "640px",
        "custom-md": "768px",
        "custom-lg": "1024px",
      },
    },

    fontSize: {
      "text-sm-semibold": [
        "14px",
        {
          lineHeight: "20px",
          letterSpacing: "0px",
          fontWeight: "600",
        },
      ],
      "text-md-semibold": [
        "16px",
        {
          lineHeight: "24px",
          fontWeight: "600",
        },
      ],
      "text-md-regular": [
        "16px",
        {
          lineHeight: "24px",
          fontWeight: "400",
        },
      ],
      "text-sm-medium": [
        "14px",
        {
          lineHeight: "20px",
          fontWeight: "500",
        },
      ],
      "display-2xl-regular": [
        "72px",
        {
          lineHeight: "90px",
          letterSpacing: "-0.02em",
          fontWeight: "400",
        },
      ],
      "display-2xl-medium": [
        "72px",
        {
          lineHeight: "90px",
          letterSpacing: "-0.02em",
          fontWeight: "500",
        },
      ],
      "display-2xl-semibold": [
        "72px",
        {
          lineHeight: "90px",
          letterSpacing: "-0.02em",
          fontWeight: "600",
        },
      ],
      "display-2xl-bold": [
        "72px",
        {
          lineHeight: "90px",
          letterSpacing: "-0.02em",
          fontWeight: "700",
        },
      ],
      "display-xl-regular": [
        "60px",
        {
          lineHeight: "72px",
          letterSpacing: "-0.02em",
          fontWeight: "400",
        },
      ],
      "display-xl-medium": [
        "60px",
        {
          lineHeight: "72px",
          letterSpacing: "-0.02em",
          fontWeight: "500",
        },
      ],
      "display-xl-semibold": [
        "60px",
        {
          lineHeight: "72px",
          letterSpacing: "-0.02em",
          fontWeight: "600",
        },
      ],
      "display-xl-bold": [
        "60px",
        {
          lineHeight: "72px",
          letterSpacing: "-0.02em",
          fontWeight: "700",
        },
      ],
      "display-lg-regular": [
        "48px",
        {
          lineHeight: "60px",
          letterSpacing: "-0.02em",
          fontWeight: "400",
        },
      ],
      "display-lg-medium": [
        "48px",
        {
          lineHeight: "60px",
          letterSpacing: "-0.02em",
          fontWeight: "500",
        },
      ],
      "display-lg-semibold": [
        "48px",
        {
          lineHeight: "60px",
          letterSpacing: "-0.02em",
          fontWeight: "600",
        },
      ],
      "display-lg-bold": [
        "48px",
        {
          lineHeight: "60px",
          letterSpacing: "-0.02em",
          fontWeight: "700",
        },
      ],
      "display-md-regular": [
        "36px",
        {
          lineHeight: "44px",
          letterSpacing: "-0.02em",
          fontWeight: "400",
        },
      ],
      "display-md-medium": [
        "36px",
        {
          lineHeight: "44px",
          letterSpacing: "-0.02em",
          fontWeight: "500",
        },
      ],
      "display-md-semibold": [
        "36px",
        {
          lineHeight: "44px",
          letterSpacing: "-0.02em",
          fontWeight: "600",
        },
      ],
      "display-md-bold": [
        "36px",
        {
          lineHeight: "44px",
          letterSpacing: "-0.02em",
          fontWeight: "700",
        },
      ],
      "display-sm-regular": [
        "30px",
        {
          lineHeight: "38px",
          fontWeight: "400",
        },
      ],
      "display-sm-medium": [
        "30px",
        {
          lineHeight: "38px",
          fontWeight: "500",
        },
      ],
      "display-sm-semibold": [
        "30px",
        {
          lineHeight: "38px",
          fontWeight: "600",
        },
      ],
      "display-sm-bold": [
        "30px",
        {
          lineHeight: "38px",
          fontWeight: "700",
        },
      ],
      "display-xs-regular": [
        "24px",
        {
          lineHeight: "32px",
          fontWeight: "400",
        },
      ],
      "display-xs-medium": [
        "24px",
        {
          lineHeight: "32px",
          fontWeight: "500",
        },
      ],
      "display-xs-semibold": [
        "24px",
        {
          lineHeight: "32px",
          fontWeight: "600",
        },
      ],
      "display-xs-bold": [
        "24px",
        {
          lineHeight: "32px",
          fontWeight: "700",
        },
      ],
      "text-xl-regular": [
        "20px",
        {
          lineHeight: "30px",
          fontWeight: "400",
        },
      ],
      "text-xl-medium": [
        "20px",
        {
          lineHeight: "30px",
          fontWeight: "500",
        },
      ],
      "text-xl-semibold": [
        "20px",
        {
          lineHeight: "30px",
          fontWeight: "600",
        },
      ],
      "text-xl-bold": [
        "20px",
        {
          lineHeight: "30px",
          fontWeight: "700",
        },
      ],
      "text-lg-regular": [
        "18px",
        {
          lineHeight: "28px",
          fontWeight: "400",
        },
      ],
      "text-lg-medium": [
        "18px",
        {
          lineHeight: "28px",
          fontWeight: "500",
        },
      ],
      "text-lg-semibold": [
        "18px",
        {
          lineHeight: "28px",
          fontWeight: "600",
        },
      ],
      "text-lg-bold": [
        "18px",
        {
          lineHeight: "28px",
          fontWeight: "700",
        },
      ],
      "text-md-medium": [
        "16px",
        {
          lineHeight: "24px",
          fontWeight: "500",
        },
      ],
      "text-md-bold": [
        "16px",
        {
          lineHeight: "24px",
          fontWeight: "700",
        },
      ],
      "text-sm-regular": [
        "14px",
        {
          lineHeight: "20px",
          fontWeight: "400",
        },
      ],
      "text-sm-bold": [
        "14px",
        {
          lineHeight: "20px",
          fontWeight: "700",
        },
      ],
      "text-xs-regular": [
        "12px",
        {
          lineHeight: "18px",
          fontWeight: "400",
        },
      ],
      "text-xs-medium": [
        "12px",
        {
          lineHeight: "18px",
          fontWeight: "500",
        },
      ],
      "text-xs-semibold": [
        "12px",
        {
          lineHeight: "18px",
          fontWeight: "600",
        },
      ],
      "text-xs-bold": [
        "12px",
        {
          lineHeight: "18px",
          fontWeight: "700",
        },
      ],
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    addVariablesForColors,
  ],
} satisfies Config;

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}

const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

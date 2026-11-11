import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        "2xs": "0 1px 2px 0 rgba(16, 24, 40, 0.03)",
        xs: "0 1px 2px 0 rgba(16, 24, 40, 0.05)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
      },
      colors: {
        dbi: {
          purple: {
            DEFAULT: "#35118F",
            50: "#f4f0fd",
            100: "#e9e1fa",
            200: "#d5c4f5",
            300: "#b99ef0",
            400: "#8e67e5",
            500: "#5524b8",
            600: "#35118F",
            700: "#2a0d72",
            800: "#1f0954",
            900: "#140537",
          },
          teal: {
            DEFAULT: "#12B98A",
            50: "#eefbf6",
            100: "#d2f6ea",
            200: "#a9edda",
            500: "#12B98A",
            600: "#0ea177",
            700: "#0b815f",
          },
          yellow: {
            DEFAULT: "#F5B51B",
            50: "#fef9ed",
            100: "#fdf2d0",
            200: "#fbe4a3",
            500: "#F5B51B",
            600: "#d6990d",
            700: "#a87508",
          },
          lavender: "#F6F5FA",
          charcoal: "#24212D",
          muted: "#6A6577",
          border: "#E5E2EE",
        },
        primary: {
          50: "#f4f0fd",
          100: "#e9e1fa",
          200: "#d5c4f5",
          300: "#b99ef0",
          400: "#8e67e5",
          500: "#5524b8",
          600: "#35118F",
          700: "#2a0d72",
          800: "#1f0954",
          900: "#140537",
          950: "#0b0220",
        },
      },
    },
  },
  plugins: [],
};
export default config;


import type { Config } from "tailwindcss"

// Note: Tailwind v4 primarily uses CSS-first configuration (see `app/globals.css`).
// This config exists to capture the v0 theme intent and keep tooling happy.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Keep explicit violet accent available even though we use CSS variables.
      colors: {
        primary: "var(--primary)",
      },
      borderRadius: {
        xl: "var(--radius)",
      },
    },
  },
  plugins: [],
}

export default config


import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211c",
        paper: "#fbfaf6",
        petrol: "#165a67",
        mint: "#1f9d68",
        amber: "#d49318",
        tomato: "#cf3e37"
      },
      // Valori usati nei modificatori di opacita' (es. text-ink/62, bg-petrol/8) che non sono
      // nella scala predefinita di Tailwind: senza questi le classi non vengono generate.
      opacity: {
        8: "0.08",
        12: "0.12",
        18: "0.18",
        48: "0.48",
        52: "0.52",
        54: "0.54",
        56: "0.56",
        58: "0.58",
        62: "0.62",
        64: "0.64",
        66: "0.66",
        68: "0.68",
        72: "0.72",
        74: "0.74",
        76: "0.76",
        78: "0.78",
        86: "0.86",
        88: "0.88",
        92: "0.92",
        94: "0.94"
      },
      boxShadow: {
        soft: "0 16px 40px rgb(23 33 28 / 0.12)"
      }
    }
  },
  plugins: []
};

export default config;

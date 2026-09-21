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
      boxShadow: {
        soft: "0 16px 40px rgb(23 33 28 / 0.12)"
      }
    }
  },
  plugins: []
};

export default config;

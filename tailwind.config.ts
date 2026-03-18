import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Poppins"', "sans-serif"],
        serif: ['"Source Serif 4"', "serif"],
      },
      borderRadius: {
        DEFAULT: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;

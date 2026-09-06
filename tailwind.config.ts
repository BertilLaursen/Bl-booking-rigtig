import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        blabooking: {
          blue: "#1D4ED8",
          bluedark: "#1E3A8A",
          bluelight: "#3B82F6",
          gray: "#1F2937",
          graylight: "#F3F4F6"
        }
      }
    }
  },
  plugins: []
};
export default config;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        paper: "#F7F6F2",
        accent: "#B4532A",
        accentdark: "#93401F",
        stone2: "#EAEAEA",
        gray2: "#555555",
        gray3: "#F3F3F3",
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        sans: ['"Be Vietnam Pro"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

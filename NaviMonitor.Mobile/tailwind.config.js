/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#000000",
        secondary: "#b7102a",
        surface: "#fcf9f8",
        'surface-container': "#f0edec",
        'surface-container-high': "#eae7e7",
        'surface-container-lowest': "#ffffff",
        'on-surface-variant': "#4c4546",
        'outline-variant': "#cfc4c5",
      },
    },
  },
  plugins: [],
}

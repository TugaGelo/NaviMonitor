/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#E63946',
        surface: '#FFFFFF',
        neutral: '#1A1A1A',
      },
    },
  },
  plugins: [],
}

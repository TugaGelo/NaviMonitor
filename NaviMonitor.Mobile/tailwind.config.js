/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#E63946',
        neutral: '#1A1A1A',
        
        background: '#fcf9f8',
        surface: '#fcf9f8',
        'surface-container-low': '#f6f3f2',
        'surface-container': '#f0eded',
        'surface-variant': '#e5e2e1',
        'on-surface': '#1c1b1b',
        'on-surface-variant': '#4c4546',
        'outline-variant': '#cfc4c5',
      },
    },
  },
  plugins: [],
}

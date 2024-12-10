/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        menu: {
          home: '#00008B',      // Blue
          delivery: '#f97316',  // Orange
          expenses: '#22c55e',  // Green
          vehicles: '#a855f7',  // Purple
          profile: '#171717'    // Black
        }
      }
    },
  },
  plugins: [],
}

// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Tilpass til mappestrukturen din
    "./index.html",
  ],
  theme: {
    extend: {

      fontFamily: {
        sans: ["Verdana", "sans-serif"],
      },

      colors: {
        turkis: {

          50:  '#ebfefc',
          100: '#c6fdf7',
          200: '#92fbf0',
          300: '#5cf7e7',
          400: '#2ceedd',
          500: '#15d5c4', // hovedfargen
          600: '#0da89b',
          700: '#0c8178',
          800: '#0e635c',
          900: '#0e4f4a',
        },
      },

      borderRadius: {
        'xl': '1rem', // ekstra myke hjørner
      },
    },
  },

  plugins: [
    require("@tailwindcss/typography"),
  ],
}

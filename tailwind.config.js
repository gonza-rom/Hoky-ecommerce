/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/context/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'jmr-green': '#16a34a',
        'jmr-green-dark': '#15803d',
        'jmr-green-light': '#22c55e',
      },
    },
  },
  plugins: [],
}
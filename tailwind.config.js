/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
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
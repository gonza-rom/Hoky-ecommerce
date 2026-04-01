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
        'hoky-black':  '#111111',
        'hoky-dark':   '#1a1a1a',
        'hoky-sand':   '#d4cfc9',
        'hoky-sand2':  '#e2ddd8',
        'hoky-sand3':  '#f0ede8',
        'hoky-gray':   '#888580',
      },
      fontFamily: {
        // Afical Neue Extra Bold no está en Google Fonts, usamos la fuente cargada localmente
        // Para títulos de marca usamos la clase .font-hoky-brand definida en globals.css
      },
    },
  },
  plugins: [],
}
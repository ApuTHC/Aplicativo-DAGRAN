/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      colors: {
        "primary1": "#018d38", 
        "primary2": "#0b5640", 
        "secondary1": "#3561ab", 
        "secondary2": "#8FCAF0", 
      },
      fontFamily: {
        'promp': ['"Promp"', 'sans-serif'], // Si es Arial Black o una fuente personalizada
      },

    },
  },
  plugins: [

  ],
}
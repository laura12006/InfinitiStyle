/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wine: {
          darkest: '#350a06',
          dark: '#56070c',
          medium: '#8f3d38',
          light: '#e1d9d9',
          lightest: '#f6f1f1'
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
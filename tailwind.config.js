/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          50:  '#e6f0f4',
          100: '#bfd6e0',
          200: '#99bbc9',
          300: '#739fb3',
          400: '#4c849d',
          500: '#266887',
          600: '#15526d',
          700: '#072e3e',
          800: '#061f2a',
          900: '#04141b',
          950: '#020a0d',
        },
      }
    },
  },
  plugins: [],
}
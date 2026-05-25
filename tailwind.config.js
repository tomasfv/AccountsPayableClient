/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c4d2fc',
          300: '#9ab3fa',
          400: '#6d8ef6',
          500: '#4f6ef1',
          600: '#3651e5',
          700: '#2c40ca',
          800: '#2836a4',
          900: '#263281',
          950: '#1a1f52',
        },
        surface: {
          DEFAULT: '#0f1117',
          card: '#161b27',
          border: '#1e2534',
          hover: '#1c2235',
        },
      },
    },
  },
  plugins: [],
}

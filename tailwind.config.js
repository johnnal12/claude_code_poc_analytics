/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        analytics: {
          50: '#fef7f0',
          100: '#fdecd8',
          200: '#fbcfa3',
          300: '#f7a962',
          400: '#f38a36',
          500: '#ef6c12',
          600: '#d9520a',
          700: '#b53d0b',
          800: '#913210',
          900: '#752b11',
          950: '#401306',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#FAF7F2',
          100: '#F3EDE4',
          200: '#E7E0D6',
          300: '#D4CBC0',
          400: '#A8A29E',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
          950: '#171411',
        },
        terra: {
          50: '#FEF5F0',
          100: '#FDE8DB',
          200: '#F9C9AC',
          300: '#F3A47A',
          400: '#E07040',
          500: '#C7522A',
          600: '#9A3A18',
          700: '#7A2E14',
          800: '#5C2310',
          900: '#3D180C',
          950: '#1F0C06',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

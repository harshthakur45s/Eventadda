/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#09090b', // Zinc 950
          900: '#18181b', // Zinc 900
          850: '#27272a', // Zinc 800
          800: '#27272a', // Zinc 800
          700: '#3f3f46', // Zinc 700
          600: '#52525b', // Zinc 600
          500: '#71717a', // Zinc 500
          400: '#a1a1aa', // Zinc 400
          300: '#d4d4d8', // Zinc 300
          200: '#e4e4e7', // Zinc 200
          100: '#f4f4f5', // Zinc 100
        },
        fuchsia: {
          600: '#27272a', // Dark matte button backgrounds
          500: '#3f3f46',
          400: '#f4f4f5', // High contrast text/accent
          300: '#d4d4d8',
          200: '#e4e4e7',
          100: '#f4f4f5',
        },
        violet: {
          950: '#09090b',
          700: '#18181b',
          600: '#27272a',
          500: '#3f3f46',
          400: '#a1a1aa',
          300: '#d4d4d8',
        },
        indigo: {
          600: '#27272a', // Zinc 800 for buttons
          500: '#3f3f46', // Zinc 700
          400: '#a1a1aa', // Zinc 400
          300: '#d4d4d8', // Zinc 300
          200: '#e4e4e7', // Zinc 200
          100: '#f4f4f5', // Zinc 100
        },
        amber: {
          400: '#71717a',
        },
        rose: {
          500: '#f43f5e',
        },
        emerald: {
          400: '#10b981',
        },
        cyber: {
          fuchsia: '#a1a1aa',
          violet: '#71717a',
          emerald: '#10b981',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-fuchsia': '0 0 0px rgba(0, 0, 0, 0)',
        'glow-violet': '0 0 0px rgba(0, 0, 0, 0)',
        'glow-emerald': '0 0 0px rgba(0, 0, 0, 0)',
      }
    },
  },
  plugins: [],
}

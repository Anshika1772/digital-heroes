/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FCFBF9',
          100: '#F9F7F2',
          200: '#F3EFE6',
          300: '#E9E2D5',
        },
        forest: {
          50: '#F1F7F4',
          100: '#DFEDE7',
          200: '#BFDDD0',
          500: '#2F7257',
          600: '#245944',
          700: '#1B4434',
          800: '#153529',
          900: '#0E231B',
          950: '#081611',
        },
        lime: {
          300: '#DCF678',
          400: '#C7EE41',
          500: '#AFDE26',
          600: '#91BC18',
        },
        ink: {
          950: '#0E1311',
          900: '#171E1B',
          800: '#25302B',
          700: '#3A4842',
          600: '#55655E',
          500: '#75867E',
          400: '#9BAAA2',
          300: '#C5D0CB',
          200: '#E1E7E4',
          100: '#F0F4F2',
        },
        gold: {
          400: '#DFC27D',
          500: '#C8A356',
          600: '#A98337',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'refined': '0 4px 20px -2px rgba(14, 35, 27, 0.05), 0 2px 6px -1px rgba(14, 35, 27, 0.03)',
        'refined-lg': '0 12px 36px -4px rgba(14, 35, 27, 0.08), 0 4px 12px -2px rgba(14, 35, 27, 0.04)',
        'refined-hover': '0 20px 40px -8px rgba(14, 35, 27, 0.12), 0 8px 16px -4px rgba(14, 35, 27, 0.06)',
      }
    },
  },
  plugins: [],
}

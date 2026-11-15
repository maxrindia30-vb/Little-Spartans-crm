/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Exact MaxR CRM 4-Colour Strict Palette
        'deep-black': '#080B0C',
        'mint-teal': '#55CDB3',
        'soft-white': '#F4F7F6',
        'deep-plum': '#493548',
        maxr: {
          black: '#080B0C',
          teal: '#55CDB3',
          'teal-hover': '#48bfa5',
          'teal-light': 'rgba(85, 205, 179, 0.15)',
          white: '#F4F7F6',
          plum: '#493548',
          'plum-hover': '#3d2c3c',
          'plum-light': 'rgba(73, 53, 72, 0.2)',
        },
        spartan: {
          cream: '#080B0C',
          orange: '#55CDB3',
          'orange-hover': '#48bfa5',
          'orange-light': 'rgba(85, 205, 179, 0.15)',
          navy: '#080B0C',
          'navy-light': '#493548',
          'navy-muted': '#493548',
          white: '#F4F7F6',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 8px -1px rgba(8, 11, 12, 0.4), 0 1px 4px -1px rgba(8, 11, 12, 0.2)',
        'card': '0 4px 18px -2px rgba(8, 11, 12, 0.5), 0 2px 6px -1px rgba(73, 53, 72, 0.2)',
        'dropdown': '0 10px 25px -5px rgba(8, 11, 12, 0.7), 0 0 1px 1px rgba(73, 53, 72, 0.3)',
      }
    },
  },
  plugins: [],
}

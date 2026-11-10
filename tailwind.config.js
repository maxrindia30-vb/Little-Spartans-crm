/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spartan: {
          cream: '#FFF4E8',
          orange: '#F4510B',
          'orange-hover': '#DC4405',
          'orange-light': '#FFEDE0',
          navy: '#172B50',
          'navy-light': '#233966',
          'navy-muted': '#485C82',
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 8px -1px rgba(23, 43, 80, 0.06), 0 1px 4px -1px rgba(23, 43, 80, 0.04)',
        'card': '0 4px 14px -2px rgba(23, 43, 80, 0.07)',
        'dropdown': '0 10px 25px -5px rgba(23, 43, 80, 0.12)',
      }
    },
  },
  plugins: [],
}

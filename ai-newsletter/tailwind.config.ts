import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        beige: {
          50:  '#fdfbf8',
          100: '#faf6f0',
          200: '#f4ece0',
          300: '#eaddc9',
          400: '#dcc9ad',
          500: '#c9a882',
          600: '#b08a5e',
          700: '#8f6b42',
          800: '#6b4e2e',
          900: '#4a3320',
        },
        rose: {
          50:  '#fdf4f0',
          100: '#fbe8df',
          200: '#f6ccba',
          300: '#eeaa8c',
          400: '#e4845e',
          500: '#d4623a',
          600: '#b8472a',
          700: '#8f3420',
          800: '#6b2518',
          900: '#4a1810',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config

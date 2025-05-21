/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Or 'media' if you prefer, but the spec says dark-mode-only
  theme: {
    extend: {
      colors: {
        'pure-dark': '#0E0F11',
        'positive': '#00E28A',
        'negative': '#FF4D67',
        'primary-action': '#3A7BFF',
        'card-stroke': '#1A1B1D', // For inner stroke
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem', // Assuming 2xl is 1rem, adjust if Tailwind's 2xl is different
      },
      boxShadow: {
        'elevation-2': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)', // Example, adjust to match "soft shadow"
      },
      spacing: {
        '16px': '16px', // For grid spacing if needed directly
        '72px': '72px', // Sidebar collapsed
        '220px': '220px', // Sidebar expanded
        '56px': '56px',  // Top bar height
        '420px': '420px' // Drawer width
      },
      gridTemplateColumns: {
        '12': 'repeat(12, minmax(0, 1fr))',
      },
      gridColumn: {
        'span-3': 'span 3 / span 3',
        'span-6': 'span 6 / span 6',
        'span-12': 'span 12 / span 12',
      },
      fontSize: {
        '32px': '2rem', // For Net Account Balance, assuming 1rem = 16px
      }
    },
  },
  plugins: [],
}
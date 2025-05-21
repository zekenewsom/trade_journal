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
        // Semantic colors
        background: '#0E0F11',
        surface: '#18191B',
        'on-background': '#FFFFFF',
        'on-surface': '#E0E0E6',
        primary: '#3A7BFF',
        'on-primary': '#FFFFFF',
        secondary: '#00E28A',
        'on-secondary': '#0E0F11',
        error: '#FF4D67',
        'on-error': '#FFFFFF',
        success: '#00E28A',
        'on-success': '#0E0F11',
        warning: '#FFC107',
        'on-warning': '#18191B',
        info: '#3A7BFF',
        'on-info': '#FFFFFF',
        // Primitives
        'pure-dark': '#0E0F11',
        'card-stroke': '#1A1B1D',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A9A9B8',
        border: '#232327',
      },
      fontFamily: {
        ui: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      borderRadius: {
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'elevation-2': '0 4px 10px rgba(0,0,0,0.3)',
      },
      spacing: {
        px: '1px',
        '0': '0',
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '32': '8rem',
        '56px': '3.5rem',
        '72px': '4.5rem',
        '220px': '13.75rem',
        '420px': '26.25rem',
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
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '32px': '2rem',
      }
    },
  },
  plugins: [],
}
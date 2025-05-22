/** @type {import('tailwindcss').Config} */
import { colors, typography, borderRadius, shadows, spacing as designSpacings } from './src/styles/design-tokens'; // Adjust path if needed

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ...colors, // Spread all your imported colors
        // You can still define Tailwind-specific aliases if needed
        // e.g. 'primary-hover': alpha(colors.primary, 0.8),
      },
      fontFamily: {
        ui: typography.fontFamily.ui.split(', '), // Tailwind expects an array
        mono: typography.fontFamily.mono.split(', '),
      },
      fontSize: typography.fontSize,
      borderRadius: borderRadius,
      boxShadow: shadows,
      spacing: designSpacings, // Use your defined spacing scale
      letterSpacing: typography.letterSpacing,
      lineHeight: typography.lineHeight,
      borderColor: { // Ensure border colors are available
        DEFAULT: colors.border,
        ...colors,
      },
      backgroundColor: ({ theme }) => ({ // Ensure background colors are available
        ...theme('colors'),
      }),
      textColor: ({ theme }) => ({ // Ensure text colors are available
        ...theme('colors'),
      }),
      ringColor: ({ theme }) => ({
        DEFAULT: theme('colors.primary', colors.primary),
        ...theme('colors'),
      }),
    },
  },
  plugins: [
    // require('@tailwindcss/forms'), // If you want to use their form reset/styling
  ],
}
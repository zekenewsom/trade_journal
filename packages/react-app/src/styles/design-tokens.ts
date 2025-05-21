// packages/react-app/src/styles/design-tokens.ts

export const colors = {
  // Semantic colors
  background: '#0E0F11', // main app background
  surface: '#18191B', // card, modal, raised surfaces
  surfaceVariant: '#23263a', // lighter surface for inputs and variants
  onBackground: '#FFFFFF', // text on background
  onSurface: '#E0E0E6', // text on surface
  primary: '#3A7BFF', // primary action/button
  onPrimary: '#FFFFFF', // text/icon on primary
  secondary: '#00E28A', // secondary accent
  onSecondary: '#0E0F11',
  accent: '#3A7BFF', // blue accent, mapped to info
  error: '#FF4D67',
  onError: '#FFFFFF',
  success: '#00E28A',
  onSuccess: '#0E0F11',
  warning: '#FFC107',
  onWarning: '#18191B',
  info: '#3A7BFF',
  onInfo: '#FFFFFF',
  // Primitives
  pureDark: '#0E0F11',
  cardStroke: '#1A1B1D',
  textPrimary: '#FFFFFF',
  textSecondary: '#A9A9B8',
  border: '#232327',
  // 'accent' is mapped to 'info' blue for highlights; 'surfaceVariant' is a lighter dark for input backgrounds.
};

export const typography = {
  fontFamily: {
    ui: 'Inter, sans-serif',
    mono: 'Roboto Mono, monospace',
  },
  fontWeight: {
    normal: 400,
    semiBold: 600,
    bold: 700,
  },
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '32px': '2rem',   // 32px (Net Account Balance)
  },
  letterSpacing: {
    tight: '-0.01em',
    normal: '0',
    wide: '0.01em',
  },
  lineHeight: {
    normal: '1.5',
    relaxed: '1.625',
    tight: '1.25',
  },
};

export const spacing = {
  px: '1px',
  '0': '0',
  '1': '0.25rem', // 4px
  '2': '0.5rem',  // 8px
  '3': '0.75rem', // 12px
  '4': '1rem',    // 16px
  '5': '1.25rem', // 20px
  '6': '1.5rem',  // 24px
  '7': '1.75rem', // 28px
  '8': '2rem',    // 32px
  '10': '2.5rem', // 40px
  '12': '3rem',   // 48px
  '16': '4rem',   // 64px
  '20': '5rem',   // 80px
  '24': '6rem',   // 96px
  '32': '8rem',   // 128px
  '56px': '3.5rem', // Top bar height (56px)
  '72px': '4.5rem', // Sidebar collapsed (72px)
  '220px': '13.75rem',// Sidebar expanded (220px)
  '420px': '26.25rem',// Drawer width (420px)
  // ...
};

export const shadows = {
  elevation2: '0 4px 10px rgba(0,0,0,0.3)', // Softer shadow for dark mode
  // Define other elevations if needed
};

export const borderRadius = {
  sm: '0.125rem',
  md: '0.25rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem', // Card corners
};

export const iconSizes = {
  default: '24px',
};

export const animation = {
  framerMotionFadeSlide: {
    duration: 0.15, // 150ms
    // You might define variants here or directly in components
  },
};

export const cardBaseClasses = 'bg-pure-dark/80 backdrop-blur-sm rounded-2xl shadow-elevation-2 border border-card-stroke';
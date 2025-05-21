// packages/react-app/src/styles/design-tokens.ts

export const colors = {
    pureDark: '#0E0F11',
    positive: '#00E28A',
    negative: '#FF4D67',
    primaryAction: '#3A7BFF',
    cardStroke: '#1A1B1D',
    // Add other grays or accent colors if they emerge
    textPrimary: '#FFFFFF', // Example
    textSecondary: '#A9A9B8', // Example
  };
  
  export const typography = {
    uiText: {
      fontFamily: 'Inter, sans-serif',
      weights: {
        normal: 400,
        semiBold: 600,
      },
      tracking: '0.01em', // Example for generous tracking
    },
    numerals: {
      fontFamily: 'Roboto Mono, monospace',
      weights: {
        normal: 400, // Assuming numerals also use 400/600
        semiBold: 600,
      },
    },
    fontSizes: { // Base on 16px = 1rem
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem',  // 24px (Lucide icon size)
      '3xl': '1.875rem', // 30px
      '32px': '2rem',   // 32px (Net Account Balance)
      // ... add more as needed
    },
  };
  
  export const spacing = {
    px: '1px',
    '0': '0',
    '1': '0.25rem', // 4px
    '2': '0.5rem',  // 8px
    '3': '0.75rem', // 12px
    '4': '1rem',    // 16px (grid space)
    '5': '1.25rem', // 20px
    '6': '1.5rem',  // 24px
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
  
  // You can also export pre-configured Tailwind classes if helpful
  export const cardBaseClasses = 'bg-pure-dark/80 backdrop-blur-sm rounded-2xl shadow-elevation-2 border border-card-stroke';
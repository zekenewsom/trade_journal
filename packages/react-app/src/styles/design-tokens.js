// packages/react-app/src/styles/design-tokens.ts
export const colors = {
    // Semantic Colors based on the target design
    background: '#0D1117', // Very dark, almost black, slightly blueish (GitHub dark-like)
    surface: '#161B22', // Cards, modals - a lighter dark gray/blue
    surfaceVariant: '#21262D', // Slightly lighter surface for input fields, hover states
    onBackground: '#C9D1D9', // Main text on dark background (light gray)
    onSurface: '#E6EDF3', // Main text on card surfaces (slightly brighter light gray)
    textPrimary: '#E6EDF3',
    textSecondary: '#8B949E', // Secondary text (medium gray)
    primary: '#58A6FF', // Bright blue for primary actions, highlights, and charts
    onPrimary: '#FFFFFF', // Text/icons on primary color
    secondary: '#3FB950', // Green for positive P&L, success states
    onSecondary: '#FFFFFF', // Text/icons on secondary color (can also be dark if contrast allows)
    success: '#3FB950', // Green for success, alias of secondary
    error: '#F85149', // Red for negative P&L, errors
    onError: '#FFFFFF',
    warning: '#F0883E', // Orange/Yellow for warnings or neutral states in charts
    onWarning: '#FFFFFF',
    info: '#58A6FF', // Blue for informational elements (can be same as primary)
    onInfo: '#FFFFFF',
    accent: '#58A6FF', // Accent color for highlights, charts (same as primary)
    onAccent: '#FFFFFF',
    // Primitive/UI Element Colors
    border: '#30363D', // Borders for cards, inputs, dividers
    cardStroke: '#30363D', // Specific for card borders if different from general border
    // Chart Specific (can alias from above or be specific)
    chartPositive: '#3FB950', // success green
    chartNegative: '#F85149', // error red
    chartNeutral: '#8B949E', // textSecondary gray for neutral R-multiples or zero lines
    chartGridLines: '#21262D', // subtle grid lines, like surfaceVariant
    // Specific UI elements from screenshot
    topBarBackground: '#161B22', // surface or a dedicated top bar color
    sidebarBackground: '#161B22', // surface
    activeNavBackground: 'rgba(88, 166, 255, 0.1)', // primary with alpha for active sidebar item
    activeNavText: '#58A6FF', // primary
    buttonSecondaryBackground: '#21262D', // surfaceVariant for secondary buttons like "Export"
    buttonSecondaryText: '#C9D1D9', // onBackground
    buttonSecondaryBorder: '#30363D', // border
    // Progress bars in cards
    progressTrack: '#30363D', // Darker track for progress bars
};
export const typography = {
    fontFamily: {
        ui: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        mono: '"Roboto Mono", "SFMono-Regular", "Consolas", "Liberation Mono", Menlo, Courier, monospace',
    },
    fontWeight: {
        light: 300,
        normal: 400,
        medium: 500, // For titles, emphasized text
        semiBold: 600,
        bold: 700,
    },
    fontSize: {
        xxs: '0.625rem', // 10px (for very small text like progress bar labels)
        xs: '0.75rem', // 12px (card titles, axis labels)
        sm: '0.875rem', // 14px (body text, descriptions)
        base: '1rem', // 16px (main values if not oversized)
        lg: '1.125rem', // 18px
        xl: '1.375rem', // 22px (main metric values)
        '2xl': '1.5rem', // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem', // 36px
        // Specifics from screenshot
        mainMetricValue: '1.75rem', // ~28px for the large numbers like Net Account Balance
        cardTitle: '0.75rem', // ~12px, often uppercase
        cardChangeIndicator: '0.75rem', // ~12px for P&L change
    },
    letterSpacing: {
        tight: '-0.02em',
        normal: '0em',
        wide: '0.025em', // For uppercase titles
    },
    lineHeight: {
        none: '1',
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.625',
    },
};
export const spacing = {
    px: '1px',
    '0': '0',
    '0.5': '0.125rem', // 2px
    '1': '0.25rem', // 4px
    '1.5': '0.375rem', // 6px
    '2': '0.5rem', // 8px
    '2.5': '0.625rem', // 10px
    '3': '0.75rem', // 12px
    '3.5': '0.875rem', // 14px
    '4': '1rem', // 16px
    '5': '1.25rem', // 20px
    '6': '1.5rem', // 24px
    '8': '2rem', // 32px
    '10': '2.5rem', // 40px
    '12': '3rem', // 48px
    '16': '4rem', // 64px
    // ... add more as needed, or use Tailwind's defaults and extend them
    topBarHeight: '3.5rem', // 56px
    sidebarWidth: '14rem', // 224px
};
export const shadows = {
    // The screenshot has very subtle or almost no distinct shadows on cards, relying on background contrast
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', // A very subtle default Tailwind shadow
    none: 'none',
    // Target design seems to use borders more than heavy shadows for separation
    elevation1: '0px 2px 4px -1px rgba(0,0,0,0.06), 0px 4px 5px 0px rgba(0,0,0,0.04), 0px 1px 10px 0px rgba(0,0,0,0.03)', // Softer, more modern shadow
    elevation2: '0px 5px 5px -3px rgba(0,0,0,0.06), 0px 8px 10px 1px rgba(0,0,0,0.04), 0px 3px 14px 2px rgba(0,0,0,0.03)',
};
export const borderRadius = {
    none: '0px',
    sm: '0.25rem', // 4px
    md: '0.5rem', // 8px (looks like what's used on cards and inputs in target)
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    full: '9999px',
};
export const animation = {
    framerMotionFadeSlide: {
        duration: 0.15,
    },
};
// Base classes for Tailwind if you want to abstract common card styling
export const cardBaseClasses = `bg-surface text-on-surface rounded-${borderRadius.md} border border-cardStroke shadow-elevation1 p-4`; // Example usage

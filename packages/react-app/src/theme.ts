import { createTheme } from '@mui/material/styles';
import { colors, typography, borderRadius, shadows } from './styles/design-tokens';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary,
      contrastText: colors.onPrimary,
    },
    secondary: {
      main: colors.secondary,
      contrastText: colors.onSecondary,
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },

    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    success: {
      main: colors.success,
      contrastText: colors.onSuccess,
    },
    error: {
      main: colors.error,
      contrastText: colors.onError,
    },
    info: {
      main: colors.info,
      contrastText: colors.onInfo,
    },
    warning: {
      main: colors.warning,
      contrastText: colors.onWarning,
    },
    divider: colors.border,
  },
  typography: {
    fontFamily: typography.fontFamily.ui,
    fontWeightRegular: typography.fontWeight.normal,
    fontWeightMedium: typography.fontWeight.semiBold,
    fontWeightBold: typography.fontWeight.bold,
    h4: { fontWeight: typography.fontWeight.bold, color: colors.onBackground },
    h5: { fontWeight: typography.fontWeight.semiBold, color: colors.onBackground },
    h6: { color: colors.success, fontWeight: typography.fontWeight.normal, marginBottom: '1rem' },
    subtitle1: { color: colors.primary },
    subtitle2: { color: colors.textSecondary },
    body1: { color: colors.onBackground },
    caption: { color: colors.textSecondary },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove MUI's default gradient on Paper in dark mode
          borderRadius: borderRadius['2xl'],
          boxShadow: shadows.elevation2,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.lg,
          textTransform: 'none',
        }
      }
    },
    // Style Recharts tooltips if possible via global CSS or wrapper components
  },
});

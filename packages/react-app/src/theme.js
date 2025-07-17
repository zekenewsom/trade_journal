// packages/react-app/src/theme.ts
import { createTheme, alpha } from '@mui/material/styles';
import { colors, typography, borderRadius, shadows, spacing } from './styles/design-tokens';
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
        error: {
            main: colors.error,
            contrastText: colors.onError,
        },
        warning: {
            main: colors.warning,
            contrastText: colors.onWarning,
        },
        info: {
            main: colors.info,
            contrastText: colors.onInfo,
        },
        success: {
            main: colors.success,
            contrastText: colors.success,
        },
        background: {
            default: colors.background,
            paper: colors.surface, // Cards and elevated surfaces
        },
        text: {
            primary: colors.textPrimary,
            secondary: colors.textSecondary,
            disabled: alpha(colors.textSecondary, 0.5),
        },
        divider: colors.border,
        action: {
            active: colors.primary,
            hover: alpha(colors.primary, 0.08),
            selected: alpha(colors.primary, 0.16),
            disabled: alpha(colors.textSecondary, 0.3),
            disabledBackground: alpha(colors.textSecondary, 0.12),
            focus: alpha(colors.primary, 0.12),
        },
    },
    typography: {
        fontFamily: typography.fontFamily.ui,
        fontWeightLight: typography.fontWeight.light,
        fontWeightRegular: typography.fontWeight.normal,
        fontWeightMedium: typography.fontWeight.medium,
        fontWeightBold: typography.fontWeight.bold,
        // Define specific variants if needed, or rely on defaults + sx prop
        h1: { fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
        h2: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
        h3: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semiBold, color: colors.textPrimary },
        h4: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semiBold, color: colors.textPrimary },
        h5: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: colors.textPrimary }, // e.g. Card titles in target
        h6: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.textPrimary },
        subtitle1: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.normal, color: colors.textSecondary }, // e.g. card subtitles
        subtitle2: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.normal, color: colors.textSecondary },
        body1: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.normal, color: colors.onSurface },
        body2: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.normal, color: colors.textSecondary },
        button: {
            textTransform: 'none',
            fontWeight: typography.fontWeight.medium,
            fontSize: typography.fontSize.sm,
        },
        caption: { fontSize: typography.fontSize.xs, color: colors.textSecondary },
        overline: {
            fontSize: typography.fontSize.xxs,
            fontWeight: typography.fontWeight.medium,
            textTransform: 'uppercase',
            letterSpacing: typography.letterSpacing.wide,
            color: colors.textSecondary,
        },
    },
    shape: {
        borderRadius: parseFloat(borderRadius.md) * 16, // MUI uses numbers for borderRadius (base 1rem = 16px)
    },
    shadows: [
        shadows.none,
        shadows.elevation1, // elevation 1
        shadows.elevation1, // elevation 2
        shadows.elevation1, // elevation 3
        shadows.elevation2, // elevation 4
        // ... fill up to 24 if needed, or customize as necessary
    ],
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: borderRadius.md, // Use your token
                    boxShadow: shadows.elevation1, // Use your token
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: borderRadius.md, // Use your token
                    padding: `${spacing['2']} ${spacing['4']}`,
                },
                containedPrimary: {
                    backgroundColor: colors.primary,
                    color: colors.onPrimary,
                    '&:hover': {
                        backgroundColor: alpha(colors.primary, 0.85),
                    },
                },
                outlinedPrimary: {
                    borderColor: colors.primary,
                    color: colors.primary,
                    '&:hover': {
                        borderColor: alpha(colors.primary, 0.7),
                        backgroundColor: alpha(colors.primary, 0.08),
                    },
                },
                // Add containedSecondary, outlinedSecondary etc. if needed
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: colors.surface,
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.border}`,
                    boxShadow: shadows.elevation1,
                }
            }
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: borderRadius.md,
                    color: colors.onSurface,
                    '&.MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: colors.border,
                        },
                        '&:hover fieldset': {
                            borderColor: alpha(colors.primary, 0.7),
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: colors.primary,
                        },
                    },
                },
                input: {
                    '&::placeholder': {
                        color: colors.textSecondary,
                        opacity: 0.8,
                    }
                }
            }
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: colors.textSecondary,
                    '&.Mui-focused': {
                        color: colors.primary,
                    }
                }
            }
        },
        MuiSelect: {
            styleOverrides: {
                icon: {
                    color: colors.textSecondary,
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    backgroundColor: alpha(colors.primary, 0.15),
                    color: colors.primary,
                    fontSize: typography.fontSize.xs,
                    height: '24px',
                    borderRadius: borderRadius.sm,
                }
            }
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: alpha(colors.background, 0.9),
                    color: colors.onSurface,
                    borderRadius: borderRadius.sm,
                    fontSize: typography.fontSize.xs,
                    border: `1px solid ${colors.border}`
                },
                arrow: {
                    color: alpha(colors.background, 0.9),
                }
            }
        }
    },
});

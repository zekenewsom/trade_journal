import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Paper, Typography, LinearProgress } from '@mui/material';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { typography, colors, borderRadius as br, spacing, shadows } from '../../../styles/design-tokens'; // Your design tokens
const MiniTrendChart = ({ data, color }) => {
    if (!data || data.length === 0)
        return null;
    return (_jsx(Box, { sx: { height: '40px', width: '100%', mt: 1 }, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsx(LineChart, { data: data, children: _jsx(Line, { type: "monotone", dataKey: "value", stroke: color, strokeWidth: 1.5, dot: false }) }) }) }));
};
const EnhancedMetricCard = ({ title, value, valuePrefix = '', valueSuffix = '', changeText, changeColor = 'neutral', descriptionText, progressValue, progressBarMinLabel, progressBarMaxLabel, progressColor = 'primary', trendData, trendColor = colors.primary, icon, minHeight = 'auto', children, }) => {
    const getChangeTextColor = () => {
        if (changeColor === 'success')
            return colors.success;
        if (changeColor === 'error')
            return colors.error;
        return colors.textSecondary;
    };
    const getProgressBarMuiColor = () => {
        return progressColor;
    };
    return (_jsxs(Paper, { elevation: 0, sx: {
            backgroundColor: colors.surface,
            padding: spacing['4'], // 1rem
            borderRadius: br.md, // 0.5rem
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.elevation1,
            color: colors.onSurface,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%', // Important for Grid stretch
            minHeight: minHeight,
        }, children: [_jsxs(Box, { children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: spacing['1'] }, children: [icon && _jsx(Box, { sx: { mr: spacing['2'], color: colors.textSecondary }, children: icon }), _jsx(Typography, { variant: "overline" // Using overline for small, uppercase titles
                                , sx: {
                                    color: colors.textSecondary,
                                    fontSize: typography.fontSize.cardTitle, // from your tokens
                                    fontWeight: typography.fontWeight.medium,
                                    lineHeight: typography.lineHeight.none,
                                }, children: title })] }), _jsxs(Typography, { variant: "h3" // Or a custom variant if h3 is too big
                        , component: "p", sx: {
                            color: colors.textPrimary,
                            fontSize: typography.fontSize.mainMetricValue, // from your tokens
                            fontWeight: typography.fontWeight.semiBold,
                            lineHeight: typography.lineHeight.tight,
                            mb: changeText ? spacing['0.5'] : spacing['1'],
                        }, children: [valuePrefix, value, valueSuffix] }), changeText && (_jsx(Typography, { variant: "caption", sx: {
                            color: getChangeTextColor(),
                            fontSize: typography.fontSize.cardChangeIndicator, // from your tokens
                            fontWeight: typography.fontWeight.medium,
                            display: 'block',
                            mb: trendData || progressValue !== undefined ? spacing['2'] : 0,
                        }, children: changeText }))] }), children && _jsx(Box, { sx: { mt: 'auto' }, children: children }), trendData && trendData.length > 0 && (_jsxs(Box, { sx: { mt: 'auto', mb: progressValue !== undefined ? spacing['1'] : 0 }, children: [" ", _jsx(MiniTrendChart, { data: trendData, color: trendColor })] })), progressValue !== undefined && (_jsxs(Box, { sx: { mt: trendData ? spacing['1'] : 'auto' }, children: [" ", _jsx(LinearProgress, { variant: "determinate", value: progressValue, color: getProgressBarMuiColor(), sx: {
                            height: '6px',
                            borderRadius: br.full,
                            backgroundColor: colors.progressTrack,
                            [`& .MuiLinearProgress-barColor${progressColor.charAt(0).toUpperCase() + progressColor.slice(1)}`]: {
                                backgroundColor: colors[progressColor] || colors.primary, // Fallback to primary
                            },
                        } }), (progressBarMinLabel || progressBarMaxLabel || descriptionText) && (_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', mt: spacing['0.5'] }, children: [_jsx(Typography, { variant: "caption", sx: { fontSize: typography.fontSize.xxs, color: colors.textSecondary }, children: progressBarMinLabel || (typeof descriptionText === 'string' && !progressBarMaxLabel ? descriptionText : '') }), progressBarMaxLabel && (_jsx(Typography, { variant: "caption", sx: { fontSize: typography.fontSize.xxs, color: colors.textSecondary }, children: progressBarMaxLabel }))] }))] }))] }));
};
export default EnhancedMetricCard;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Typography } from '@mui/material';
import { colors, typography, borderRadius as br, spacing } from '../../styles/design-tokens';
import { alpha } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import { formatCurrency } from '../dashboard/DashboardMetrics';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays, subDays } from 'date-fns';
// Helper to generate days for a specific month, including padding for weeks
const getMonthDaysForCalendar = (dateInMonth) => {
    const firstDay = startOfMonth(dateInMonth);
    const lastDay = endOfMonth(dateInMonth);
    // Sunday is 0, Monday is 1 ... Saturday is 6
    // We want Monday as the start of the week in display (index 0)
    const startOffset = (getDay(firstDay) + 6) % 7; // 0 for Mon, 1 for Tue ... 6 for Sun
    const days = [];
    // Add padding days from previous month
    for (let i = 0; i < startOffset; i++) {
        days.push({ date: subDays(firstDay, startOffset - i), isCurrentMonth: false, pnl: 0 });
    }
    eachDayOfInterval({ start: firstDay, end: lastDay }).forEach(day => {
        days.push({ date: day, isCurrentMonth: true, pnl: 0 }); // PNL will be filled later
    });
    let endOffset = 6 - ((getDay(lastDay) + 6) % 7);
    // Ensure full 5 or 6 weeks are displayed
    const totalCells = days.length;
    const requiredCellsToFillWeek = (7 - (totalCells % 7)) % 7;
    endOffset = requiredCellsToFillWeek;
    for (let i = 1; i <= endOffset; i++) {
        days.push({ date: addDays(lastDay, i), isCurrentMonth: false, pnl: 0 });
    }
    return days;
};
export function DailyHeatmapCalendar({ data, targetMonth = new Date(), height = '100%' }) {
    const monthDays = getMonthDaysForCalendar(targetMonth);
    const pnlLookup = new Map(data.map(d => [d.date, d.pnl]));
    const calendarData = monthDays.map(dayObj => ({
        ...dayObj,
        pnl: pnlLookup.get(format(dayObj.date, 'yyyy-MM-dd')) ?? 0,
    }));
    const getCellColor = (pnl, isCurrentMonth) => {
        if (!isCurrentMonth)
            return alpha(colors.surfaceVariant, 0.3);
        if (pnl === 0)
            return colors.surfaceVariant; // Neutral for zero P&L
        const absolutePnl = Math.abs(pnl);
        // Determine max PNL for scaling (can be passed as prop or calculated from data)
        const maxPnlValue = Math.max(...data.map(d => Math.abs(d.pnl)), 1); // Avoid division by zero
        let intensity = Math.min(absolutePnl / maxPnlValue, 1) * 0.8 + 0.2; // Min 20% opacity, max 100%
        intensity = Math.max(0.2, Math.min(intensity, 1)); // Clamp between 0.2 and 1
        if (pnl > 0)
            return alpha(colors.secondary, intensity);
        if (pnl < 0)
            return alpha(colors.error, intensity);
        return colors.surfaceVariant;
    };
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return (_jsxs(Box, { sx: { height, display: 'flex', flexDirection: 'column' }, children: [_jsx(Box, { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: spacing['0.5'], mb: spacing['1'], children: weekDays.map(day => (_jsx(Typography, { variant: "caption", align: "center", sx: { color: colors.textSecondary, fontSize: typography.fontSize.xxs }, children: day }, day))) }), _jsx(Box, { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: spacing['0.5'], flexGrow: 1, children: calendarData.map(({ date, pnl, isCurrentMonth }, index) => (_jsx(Tooltip, { title: isCurrentMonth ? `${format(date, 'MMM d')}: ${formatCurrency(pnl, true)}` : format(date, 'MMM d'), placement: "top", arrow: true, children: _jsxs(Box, { sx: {
                            backgroundColor: getCellColor(pnl, isCurrentMonth),
                            borderRadius: br.sm,
                            aspectRatio: '1 / 1', // Makes cells square by default
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: spacing['0.5'],
                            opacity: isCurrentMonth ? 1 : 0.5,
                            cursor: isCurrentMonth ? 'default' : 'not-allowed',
                        }, children: [_jsx(Typography, { variant: "caption", sx: {
                                    fontSize: typography.fontSize.xxs,
                                    color: isCurrentMonth ? (Math.abs(pnl) > 0.5 * Math.max(...data.map(d => Math.abs(d.pnl))) ? colors.onPrimary : colors.textSecondary) : alpha(colors.textSecondary, 0.7),
                                    fontWeight: isCurrentMonth ? typography.fontWeight.medium : typography.fontWeight.normal,
                                    lineHeight: 1.2
                                }, children: format(date, 'd') }), isCurrentMonth && pnl !== 0 && (_jsxs(Typography, { variant: "caption", sx: {
                                    fontSize: '0.6rem', // even smaller for pnl
                                    color: pnl > 0 ? colors.secondary : colors.error,
                                    fontWeight: typography.fontWeight.semiBold,
                                    lineHeight: 1,
                                    mt: '2px'
                                }, children: [pnl > 0 ? '+' : '', Math.abs(pnl) < 1000 ? pnl.toFixed(0) : `${(pnl / 1000).toFixed(1)}k`] }))] }) }, index))) }), _jsxs(Box, { display: "flex", justifyContent: "center", alignItems: "center", gap: spacing['1'], mt: spacing['1.5'], children: [_jsx(Typography, { variant: "caption", sx: { color: colors.textSecondary, fontSize: typography.fontSize.xxs }, children: "Less" }), _jsx(Box, { sx: { width: 12, height: 12, borderRadius: '2px', bgcolor: alpha(colors.error, 0.3) } }), _jsx(Box, { sx: { width: 12, height: 12, borderRadius: '2px', bgcolor: alpha(colors.error, 0.7) } }), _jsx(Box, { sx: { width: 12, height: 12, borderRadius: '2px', bgcolor: colors.surfaceVariant } }), _jsx(Box, { sx: { width: 12, height: 12, borderRadius: '2px', bgcolor: alpha(colors.secondary, 0.3) } }), _jsx(Box, { sx: { width: 12, height: 12, borderRadius: '2px', bgcolor: alpha(colors.secondary, 0.7) } }), _jsx(Typography, { variant: "caption", sx: { color: colors.textSecondary, fontSize: typography.fontSize.xxs }, children: "More" })] })] }));
}

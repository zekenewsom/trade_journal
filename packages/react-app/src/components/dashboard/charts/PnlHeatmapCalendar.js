import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { Tooltip, Typography, IconButton } from '@mui/material';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameDay, getMonth } from 'date-fns';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
const PnlHeatmapCalendar = ({ data }) => {
    // Month/year state
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    // Filter data for current month/year
    const dataMap = useMemo(() => {
        const map = new Map();
        data.forEach(pt => map.set(pt.date, pt.pnl));
        return map;
    }, [data]);
    // Calendar grid: 7x6 (weeks x days)
    const firstDayOfMonth = useMemo(() => startOfMonth(new Date(currentYear, currentMonth)), [currentMonth, currentYear]);
    const lastDayOfMonth = useMemo(() => endOfMonth(new Date(currentYear, currentMonth)), [currentMonth, currentYear]);
    const startDate = useMemo(() => startOfWeek(firstDayOfMonth, { weekStartsOn: 0 }), [firstDayOfMonth]);
    const endDate = useMemo(() => endOfWeek(lastDayOfMonth, { weekStartsOn: 0 }), [lastDayOfMonth]);
    const calendarDays = useMemo(() => {
        const days = [];
        let day = startDate;
        while (day <= endDate) {
            days.push(day);
            day = addDays(day, 1);
        }
        return days;
    }, [startDate, endDate]);
    // Handlers
    const handlePrevMonth = () => {
        const prev = subMonths(new Date(currentYear, currentMonth), 1);
        setCurrentMonth(prev.getMonth());
        setCurrentYear(prev.getFullYear());
    };
    const handleNextMonth = () => {
        const next = addMonths(new Date(currentYear, currentMonth), 1);
        setCurrentMonth(next.getMonth());
        setCurrentYear(next.getFullYear());
    };
    // Color logic
    const getColor = (pnl) => {
        if (pnl === undefined)
            return '#e0e0e0';
        if (pnl > 0)
            return '#4caf50';
        if (pnl < 0)
            return '#e57373';
        return '#bdbdbd';
    };
    // Weekday headers
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 8 }, children: [_jsx(IconButton, { onClick: handlePrevMonth, size: "small", children: _jsx(ChevronLeftIcon, {}) }), _jsx(Typography, { sx: { mx: 1, fontWeight: 500 }, children: format(new Date(currentYear, currentMonth), 'MMMM yyyy') }), _jsx(IconButton, { onClick: handleNextMonth, size: "small", children: _jsx(ChevronRightIcon, {}) })] }), _jsx("div", { className: "flex flex-row gap-1 mb-1", style: { background: 'none', boxShadow: 'none' }, children: weekDays.map(day => (_jsx("div", { className: "text-xs font-semibold text-gray-500", style: { width: 32, textAlign: 'center' }, children: day }, day))) }), _jsx("div", { className: "flex flex-col gap-1", style: { background: 'none', boxShadow: 'none' }, children: [0, 1, 2, 3, 4, 5].map(weekIdx => (_jsx("div", { className: "flex flex-row gap-1", children: calendarDays.slice(weekIdx * 7, weekIdx * 7 + 7).map((dateObj) => {
                        const dateStr = format(dateObj, 'yyyy-MM-dd');
                        const pnl = dataMap.get(dateStr);
                        const isCurrentMonth = getMonth(dateObj) === currentMonth;
                        return (_jsx(Tooltip, { title: pnl !== undefined ? `${format(dateObj, 'MMM d')}: $${pnl.toFixed(2)}` : format(dateObj, 'MMM d'), arrow: true, children: _jsx("div", { className: `rounded cursor-pointer border ${isCurrentMonth ? 'border-gray-300' : 'border-gray-100'} ${isSameDay(dateObj, today) ? 'ring-2 ring-blue-400' : ''}`, style: {
                                    boxShadow: 'none',
                                    border: '1px solid transparent',
                                    width: 32,
                                    height: 32,
                                    background: getColor(isCurrentMonth ? pnl : undefined),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 12,
                                    color: '#fff',
                                    opacity: isCurrentMonth ? 1 : 0.18,
                                    transition: 'background 0.2s',
                                }, children: dateObj.getDate() }) }, dateStr));
                    }) }, weekIdx))) })] }));
};
export default PnlHeatmapCalendar;

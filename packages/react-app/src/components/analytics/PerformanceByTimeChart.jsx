import { useEffect, useState } from 'react';
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(max-width: 639px)').matches;
    });
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mediaQuery = window.matchMedia('(max-width: 639px)');
        const handleChange = () => setIsMobile(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);
    return isMobile;
}
const PerformanceByTimeChart = ({ title, data, dataKeyX, dataKeyY }) => {
    const isMobile = useIsMobile();
    if (!data || data.length === 0) {
        return (_jsxs("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: ["No data available for ", title, "."] }));
    }
    return (_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold mb-4 text-on-surface", children: title }), _jsx("div", { className: isMobile ? "h-[240px]" : "h-[400px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: data, margin: { top: 20, right: 30, left: 20, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--color-card-stroke)" }), _jsx(XAxis, { dataKey: dataKeyX, tick: { fontSize: 12, fill: 'var(--color-on-surface-variant)' }, interval: isMobile ? 'preserveStartEnd' : 0 }), _jsx(YAxis, { tickFormatter: (value) => `$${value.toFixed(0)}`, tick: { fontSize: 12, fill: 'var(--color-on-surface-variant)' } }), _jsx(Tooltip, { formatter: (value) => [`$${value.toFixed(2)}`, 'P&L'], contentStyle: {
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid var(--color-card-stroke)',
                                    borderRadius: '0.375rem'
                                } }), _jsx(Bar, { dataKey: dataKeyY, name: "P&L", children: data.map((entry, index) => (_jsx(Cell, { fill: entry.totalNetPnl >= 0 ? 'var(--color-success)' : 'var(--color-error)' }, `cell-${index}`))) })] }) }) })] }));
};
export default PerformanceByTimeChart;

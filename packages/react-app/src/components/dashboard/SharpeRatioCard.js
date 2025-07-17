import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { useTheme } from '@mui/material/styles';
export function SharpeRatioCard({ value = 2.37, status = 'good' }) {
    // Calculate the ratio for the progress bar (assuming good > 2, moderate 1-2, bad < 1)
    const ratio = Math.min(value / 4, 1) * 100;
    const theme = useTheme();
    return (_jsx(MetricCard, { title: "Sharpe Ratio (YTD)", status: status, className: "bg-white", children: _jsxs("div", { className: "flex flex-col", children: [_jsx("div", { className: "text-2xl font-semibold font-mono text-primary", children: _jsx(CountUp, { end: value, decimals: 2, preserveValue: true }) }), _jsxs("div", { className: "flex items-center justify-between mt-1 mb-1", children: [_jsx("div", { className: "text-xs text-secondary", children: "Poor" }), _jsx("div", { className: "text-xs text-secondary", children: "Good" })] }), _jsx("div", { className: "w-full h-1 rounded-full bg-gray-200", children: _jsx("div", { style: {
                            width: `${ratio}%`,
                            height: '100%',
                            borderRadius: '9999px',
                            background: status === 'good'
                                ? theme.palette.success.main
                                : status === 'moderate'
                                    ? theme.palette.warning.main
                                    : theme.palette.error.main
                        } }) })] }) }));
}

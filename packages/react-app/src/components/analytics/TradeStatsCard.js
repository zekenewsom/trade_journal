import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const TradeStatsCard = ({ analytics }) => {
    const stats = [
        {
            label: 'Average Win',
            value: analytics.avgWinPnlOverall ? `$${analytics.avgWinPnlOverall.toFixed(2)}` : 'N/A',
            color: 'text-positive'
        },
        {
            label: 'Average Loss',
            value: analytics.avgLossPnlOverall ? `$${analytics.avgLossPnlOverall.toFixed(2)}` : 'N/A',
            color: 'text-negative'
        },
        {
            label: 'Largest Win',
            value: analytics.largestWinPnl ? `$${analytics.largestWinPnl.toFixed(2)}` : 'N/A',
            color: 'text-positive'
        },
        {
            label: 'Largest Loss',
            value: analytics.largestLossPnl ? `$${analytics.largestLossPnl.toFixed(2)}` : 'N/A',
            color: 'text-negative'
        },
        {
            label: 'Profit Factor',
            value: analytics.totalRealizedGrossPnl && analytics.totalFeesPaidOnClosedPortions
                ? ((analytics.totalRealizedGrossPnl - analytics.totalFeesPaidOnClosedPortions) /
                    Math.abs(analytics.totalFeesPaidOnClosedPortions)).toFixed(2)
                : 'N/A',
            color: 'text-primary-action'
        },
        {
            label: 'Average R-Multiple',
            value: analytics.avgRMultiple ? analytics.avgRMultiple.toFixed(2) : 'N/A',
            color: 'text-primary-action'
        }
    ];
    return (_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold mb-4 text-on-surface", children: "Trade Statistics" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: stats.map((stat, index) => (_jsxs("div", { className: "rounded-2xl p-4 border bg-surface border-card-stroke", children: [_jsx("p", { className: "text-sm font-medium mb-1 text-on-surface-variant", children: stat.label }), _jsx("p", { className: `text-xl font-bold ${stat.color === 'text-positive' ? 'text-success' : stat.color === 'text-negative' ? 'text-error' : 'text-primary'}`, children: stat.value })] }, index))) })] }));
};
export default TradeStatsCard;

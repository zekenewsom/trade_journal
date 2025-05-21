import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// File: zekenewsom-trade_journal/packages/react-app/src/views/AnalyticsPage.tsx
// New file for Stage 6
import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PnlVsDurationScatterPlot from '../components/analytics/PnlVsDurationScatterPlot';
import PerformanceByTimeChart from '../components/analytics/PerformanceByTimeChart';
import GroupedPerformanceTable from '../components/analytics/GroupedPerformanceTable';
import TradeStatsCard from '../components/analytics/TradeStatsCard';
import EquityCurveChart from '../components/analytics/EquityCurveChart';
import Grid from '@mui/material/Grid';
import { Box, Button, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getAnalyticsData } from '../api/analytics';
const AnalyticsPage = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        dateRange: {
            startDate: null,
            endDate: null
        }
    });
    const [unrealizedPnl, setUnrealizedPnl] = useState(null);
    // Fetch Unrealized P&L from all trades
    useEffect(() => {
        async function fetchUnrealizedPnl() {
            try {
                if (window.electronAPI?.getTrades) {
                    const trades = await window.electronAPI.getTrades();
                    const sum = trades.reduce((acc, t) => acc + (typeof t.unrealized_pnl === 'number' ? t.unrealized_pnl : 0), 0);
                    setUnrealizedPnl(sum);
                }
            }
            catch (err) {
                setUnrealizedPnl(null);
            }
        }
        fetchUnrealizedPnl();
    }, []);
    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAnalyticsData(filters);
            setAnalytics(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchAnalyticsData();
    }, [filters]);
    const handleDateChange = (field) => (date) => {
        setFilters(prev => ({
            ...prev,
            dateRange: {
                startDate: field === 'startDate' ? (date ? date.toISOString() : null) : prev.dateRange?.startDate ?? null,
                endDate: field === 'endDate' ? (date ? date.toISOString() : null) : prev.dateRange?.endDate ?? null
            }
        }));
    };
    const clearFilters = () => {
        setFilters({
            dateRange: {
                startDate: null,
                endDate: null
            }
        });
    };
    if (loading) {
        return (_jsx(Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }, children: _jsx(CircularProgress, { className: "text-primary-action" }) }));
    }
    if (error) {
        return (_jsx(Box, { sx: { p: 4 }, children: _jsx(Alert, { severity: "error", children: error }) }));
    }
    if (!analytics) {
        return null;
    }
    return (_jsxs(Box, { sx: { minHeight: '100vh', backgroundColor: '#181a27', color: '#e0e0e0', p: { xs: 2, md: 4 } }, children: [_jsxs(Paper, { elevation: 2, sx: { mb: 4, p: { xs: 2, md: 3 }, backgroundColor: '#1e2230', color: '#e0e0e0', borderRadius: 3, boxShadow: 3 }, children: [_jsx(Typography, { variant: "h4", sx: { fontWeight: 'bold', mb: 1 }, children: "Trading Analytics" }), _jsx(Typography, { sx: { color: '#8be9fd' }, children: "Comprehensive analysis of your trading performance" })] }), _jsxs(Grid, { container: true, spacing: 3, alignItems: "stretch", sx: { mb: 4 }, children: [_jsx(Grid, { item: true, xs: 12, md: 3, children: _jsxs(Paper, { sx: { p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }, children: [_jsx(Typography, { sx: { color: '#8be9fd', fontSize: 14, fontWeight: 500, mb: 1 }, children: "Total Net P&L" }), _jsx(Typography, { sx: { fontSize: 24, fontWeight: 'bold', color: analytics.totalRealizedNetPnl >= 0 ? '#4CAF50' : '#f44336' }, children: analytics && analytics.totalRealizedNetPnl !== undefined ? `$${analytics.totalRealizedNetPnl.toFixed(2)}` : 'N/A' })] }) }), _jsx(Grid, { item: true, xs: 12, md: 3, children: _jsxs(Paper, { sx: { p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }, children: [_jsx(Typography, { sx: { color: '#8be9fd', fontSize: 14, fontWeight: 500, mb: 1 }, children: "Unrealized P&L" }), _jsx(Typography, { sx: { fontSize: 24, fontWeight: 'bold', color: (unrealizedPnl ?? 0) >= 0 ? '#4CAF50' : '#f44336' }, children: unrealizedPnl !== null && unrealizedPnl !== undefined ? `$${unrealizedPnl.toFixed(2)}` : 'N/A' })] }) }), _jsx(Grid, { item: true, xs: 12, md: 3, children: _jsxs(Paper, { sx: { p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }, children: [_jsx(Typography, { sx: { color: '#8be9fd', fontSize: 14, fontWeight: 500, mb: 1 }, children: "Win Rate" }), _jsx(Typography, { sx: { fontSize: 24, fontWeight: 'bold', color: '#e0e0e0' }, children: analytics && analytics.winRateOverall !== undefined && analytics.winRateOverall !== null ? `${(analytics.winRateOverall * 100).toFixed(1)}%` : 'N/A' })] }) }), _jsx(Grid, { item: true, xs: 12, md: 3, children: _jsxs(Paper, { sx: { p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }, children: [_jsx(Typography, { sx: { color: '#8be9fd', fontSize: 14, fontWeight: 500, mb: 1 }, children: "Max Drawdown" }), _jsx(Typography, { sx: { fontSize: 24, fontWeight: 'bold', color: '#f44336' }, children: analytics && analytics.maxDrawdownPercentage !== undefined && analytics.maxDrawdownPercentage !== null ? `${analytics.maxDrawdownPercentage.toFixed(1)}%` : 'N/A' })] }) }), _jsx(Grid, { item: true, xs: 12, md: 3, children: _jsxs(Paper, { sx: { p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }, children: [_jsx(Typography, { sx: { color: '#8be9fd', fontSize: 14, fontWeight: 500, mb: 1 }, children: "Total Trades" }), _jsx(Typography, { sx: { fontSize: 24, fontWeight: 'bold', color: '#e0e0e0' }, children: analytics ? analytics.numberOfWinningTrades + analytics.numberOfLosingTrades + analytics.numberOfBreakEvenTrades : 'N/A' })] }) })] }), _jsx(Paper, { sx: { p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1, mb: 4 }, children: _jsxs(Grid, { container: true, spacing: 2, alignItems: "center", wrap: "wrap", children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 6, children: _jsx(LocalizationProvider, { dateAdapter: AdapterDateFns, children: _jsx(DatePicker, { label: "Start Date", value: filters.dateRange && filters.dateRange.startDate ? new Date(filters.dateRange.startDate) : null, onChange: handleDateChange('startDate'), slotProps: {
                                        textField: {
                                            fullWidth: true,
                                            sx: { background: '#23263a', input: { color: '#e0e0e0' } }
                                        }
                                    } }) }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 6, children: _jsx(LocalizationProvider, { dateAdapter: AdapterDateFns, children: _jsx(DatePicker, { label: "End Date", value: filters.dateRange && filters.dateRange.endDate ? new Date(filters.dateRange.endDate) : null, onChange: handleDateChange('endDate'), slotProps: {
                                        textField: {
                                            fullWidth: true,
                                            sx: { background: '#23263a', input: { color: '#e0e0e0' } }
                                        }
                                    } }) }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 6, children: _jsx(Button, { variant: "outlined", onClick: clearFilters, fullWidth: true, sx: { borderColor: '#3A7BFF', color: '#8be9fd', borderRadius: 2, px: 2, minWidth: 120, '&:hover': { backgroundColor: '#3A7BFF', color: '#fff' } }, children: "Reset Filters" }) })] }) }), _jsxs(Grid, { container: true, spacing: 3, alignItems: "stretch", sx: { mb: 4 }, children: [_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Paper, { sx: { p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 2, color: '#e0e0e0' }, children: "Equity Curve" }), _jsx(Box, { sx: { height: 400 }, children: _jsx(EquityCurveChart, { equityCurve: analytics.equityCurve }) })] }) }), _jsx(Grid, { item: true, xs: 12, md: 6, children: _jsxs(Paper, { sx: { p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 2, color: '#e0e0e0' }, children: "P&L Distribution" }), _jsx(Box, { sx: { height: 400 }, children: analytics.pnlPerTradeSeries && analytics.pnlPerTradeSeries.length > 0 && (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: analytics.pnlPerTradeSeries, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#2A2B2D" }), _jsx(XAxis, { dataKey: "date", tick: { fontSize: 12, fill: '#9CA3AF' } }), _jsx(YAxis, { tickFormatter: (value) => `$${value.toFixed(0)}`, tick: { fontSize: 12, fill: '#9CA3AF' } }), _jsx(Tooltip, { formatter: (value) => [`$${value.toFixed(2)}`, 'P&L'], contentStyle: { backgroundColor: '#1A1B1D', border: '1px solid #2A2B2D' } }), _jsx(Bar, { dataKey: "pnl", name: "P&L", children: analytics.pnlPerTradeSeries.map((entry, index) => (_jsx(Cell, { fill: entry.pnl >= 0 ? '#00E28A' : '#FF4D67', opacity: entry.isFullyClosed ? 1 : 0.5 }, `cell-${index}`))) })] }) })) })] }) })] }), _jsx(Paper, { sx: { p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1, mb: 4 }, children: _jsx(TradeStatsCard, { analytics: analytics }) }), _jsxs(Paper, { sx: { p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1, mb: 4 }, children: [_jsx(Typography, { variant: "h6", sx: { fontWeight: 600, mb: 2, color: '#e0e0e0' }, children: "Trade Outcomes" }), _jsx(Box, { sx: { height: 400 }, children: analytics.winLossBreakEvenCounts && analytics.winLossBreakEvenCounts.some(item => item.value > 0) && (_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: analytics.winLossBreakEvenCounts, cx: "50%", cy: "50%", labelLine: false, label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, outerRadius: 150, fill: "#8884d8", dataKey: "value", children: analytics.winLossBreakEvenCounts.map((entry, index) => (_jsx(Cell, { fill: entry.name === 'Wins' ? '#00E28A' : entry.name === 'Losses' ? '#FF4D67' : '#FFBB28' }, `cell-${index}`))) }), _jsx(Tooltip, { formatter: (value) => [value, 'Trades'], contentStyle: { backgroundColor: '#1A1B1D', border: '1px solid #2A2B2D' } })] }) })) })] }), analytics.rMultipleDistribution && analytics.rMultipleDistribution.length > 0 && (_jsxs(Paper, { sx: { backgroundColor: '#23263a', borderRadius: 3, p: 3, mb: 4, border: '1px solid #23263a' }, children: [_jsx(Typography, { variant: "h6", sx: { fontSize: 20, fontWeight: 600, mb: 2, color: '#e0e0e0' }, children: "R-Multiple Distribution" }), _jsxs(Typography, { sx: { color: '#8be9fd', mb: 2 }, children: ["Average R-Multiple: ", analytics.avgRMultiple !== null ? analytics.avgRMultiple.toFixed(2) : 'N/A'] }), _jsx(Box, { sx: { height: 400 }, children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: analytics.rMultipleDistribution, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#2A2B2D" }), _jsx(XAxis, { dataKey: "range", tick: { fontSize: 12, fill: '#9CA3AF' } }), _jsx(YAxis, { allowDecimals: false, tick: { fontSize: 12, fill: '#9CA3AF' } }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#1A1B1D', border: '1px solid #2A2B2D' } }), _jsx(Bar, { dataKey: "count", name: "Number of Trades", fill: "#3A7BFF" })] }) }) })] })), analytics.pnlVsDurationSeries && analytics.pnlVsDurationSeries.length > 0 && (_jsxs(Paper, { sx: { backgroundColor: '#23263a', borderRadius: 3, p: 3, mb: 4, border: '1px solid #23263a' }, children: [_jsx(Typography, { variant: "h6", sx: { fontSize: 20, fontWeight: 600, mb: 2, color: '#e0e0e0' }, children: "P&L vs Trade Duration" }), _jsx(Box, { sx: { height: 400 }, children: _jsx(PnlVsDurationScatterPlot, { data: analytics.pnlVsDurationSeries }) })] })), _jsxs(Grid, { container: true, spacing: 3, alignItems: "stretch", sx: { mb: 4 }, children: [analytics.pnlByAssetClass && analytics.pnlByAssetClass.length > 0 && (_jsx(Grid, { item: true, xs: 12, md: 4, lg: 4, children: _jsx(Paper, { sx: { p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }, children: _jsx(GroupedPerformanceTable, { title: "Performance by Asset Class", data: analytics.pnlByAssetClass }) }) })), analytics.pnlByExchange && analytics.pnlByExchange.length > 0 && (_jsx(Grid, { item: true, xs: 12, md: 4, lg: 4, children: _jsx(Paper, { sx: { p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }, children: _jsx(GroupedPerformanceTable, { title: "Performance by Exchange", data: analytics.pnlByExchange }) }) })), analytics.pnlByStrategy && analytics.pnlByStrategy.length > 0 && (_jsx(Grid, { item: true, xs: 12, md: 4, lg: 4, children: _jsx(Paper, { sx: { p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }, children: _jsx(GroupedPerformanceTable, { title: "Performance by Strategy", data: analytics.pnlByStrategy }) }) })), analytics.pnlByEmotion && analytics.pnlByEmotion.length > 0 && (_jsx(Grid, { item: true, xs: 12, md: 4, lg: 4, children: _jsx(Paper, { sx: { p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }, children: _jsx(GroupedPerformanceTable, { title: "Performance by Emotional State", data: analytics.pnlByEmotion }) }) }))] }), _jsxs(Grid, { container: true, spacing: 3, alignItems: "stretch", children: [analytics.pnlByMonth && analytics.pnlByMonth.length > 0 && (_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Paper, { sx: { p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }, children: _jsx(PerformanceByTimeChart, { title: "Monthly Performance", data: analytics.pnlByMonth, dataKeyX: "period", dataKeyY: "totalNetPnl" }) }) })), analytics.pnlByDayOfWeek && analytics.pnlByDayOfWeek.length > 0 && (_jsx(Grid, { item: true, xs: 12, md: 6, children: _jsx(Paper, { sx: { p: 3, backgroundColor: '#23263a', color: '#e0e0e0', borderRadius: 3, boxShadow: 1 }, children: _jsx(PerformanceByTimeChart, { title: "Performance by Day of Week", data: analytics.pnlByDayOfWeek, dataKeyX: "period", dataKeyY: "totalNetPnl" }) }) }))] })] }));
};
export default AnalyticsPage;

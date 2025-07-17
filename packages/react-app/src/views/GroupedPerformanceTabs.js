import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import GroupedPerformanceTable from '../components/analytics/GroupedPerformanceTable';
const tabConfigs = [
    { label: 'By Strategy', key: 'pnlByStrategy', title: 'Performance by Strategy' },
    { label: 'By Asset Class', key: 'pnlByAssetClass', title: 'Performance by Asset Class' },
    { label: 'By Exchange', key: 'pnlByExchange', title: 'Performance by Exchange' },
    { label: 'By Emotion', key: 'pnlByEmotion', title: 'Performance by Emotion' },
    { label: 'By Asset', key: 'pnlByAsset', title: 'Performance by Asset' },
];
export default function GroupedPerformanceTabs({ analytics }) {
    const [tab, setTab] = useState(0);
    const getData = (key) => {
        if (!analytics)
            return [];
        // AnalyticsData uses slightly different keys
        switch (key) {
            case 'pnlByStrategy': return analytics.pnlByStrategy || [];
            case 'pnlByAssetClass': return analytics.pnlByAssetClass || [];
            case 'pnlByExchange': return analytics.pnlByExchange || [];
            case 'pnlByEmotion': return analytics.pnlByEmotion || [];
            case 'pnlByAsset': return analytics.pnlByAsset || [];
            default: return [];
        }
    };
    return (_jsxs(Box, { sx: { width: '100%', bgcolor: 'var(--color-surface)', borderRadius: 2, boxShadow: 1, p: 2 }, children: [_jsx(Tabs, { value: tab, onChange: (_event, newValue) => setTab(newValue), variant: "scrollable", scrollButtons: "auto", sx: { mb: 2 }, children: tabConfigs.map((tabConfig) => (_jsx(Tab, { label: tabConfig.label }, tabConfig.key))) }), tabConfigs.map((tabConfig, idx) => (_jsx(Box, { sx: { display: tab === idx ? 'block' : 'none' }, children: _jsx(GroupedPerformanceTable, { title: tabConfig.title, data: getData(tabConfig.key) }) }, tabConfig.key)))] }));
}

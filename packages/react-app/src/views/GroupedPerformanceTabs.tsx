import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import GroupedPerformanceTable from '../components/analytics/GroupedPerformanceTable';
import type { AnalyticsData } from '../types';

interface Props {
  analytics: AnalyticsData | null;
}

const tabConfigs = [
  { label: 'By Strategy', key: 'pnlByStrategy', title: 'Performance by Strategy' },
  { label: 'By Asset Class', key: 'pnlByAssetClass', title: 'Performance by Asset Class' },
  { label: 'By Exchange', key: 'pnlByExchange', title: 'Performance by Exchange' },
  { label: 'By Emotion', key: 'pnlByEmotion', title: 'Performance by Emotion' },
  { label: 'By Asset', key: 'pnlByAsset', title: 'Performance by Asset' },
];

export default function GroupedPerformanceTabs({ analytics }: Props) {
  const [tab, setTab] = useState(0);

  const getData = (key: string) => {
    if (!analytics) return [];
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

  return (
    <Box sx={{ width: '100%', bgcolor: 'var(--color-surface)', borderRadius: 2, boxShadow: 1, p: 2 }}>
      <Tabs
        value={tab}
        onChange={(_event: React.SyntheticEvent, newValue: number) => setTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        {tabConfigs.map((tabConfig) => (
          <Tab key={tabConfig.key} label={tabConfig.label} />
        ))}
      </Tabs>
      {tabConfigs.map((tabConfig, idx) => (
        <Box key={tabConfig.key} sx={{ display: tab === idx ? 'block' : 'none' }}>
          <GroupedPerformanceTable title={tabConfig.title} data={getData(tabConfig.key)} />
        </Box>
      ))}
    </Box>
  );
}

import { MetricCard } from '../ui/MetricCard';
import { NetBalanceCard } from './NetBalanceCard';
import { UnrealizedPnLCard } from './UnrealizedPnLCard';
import { useEffect, useState } from 'react';

import { BuyingPowerCard } from './BuyingPowerCard';
import { SharpeRatioCard } from './SharpeRatioCard';
import { SortinoRatioCard } from './SortinoRatioCard';
import { ProfitFactorCard } from './ProfitFactorCard';
import { KellyPercentCard } from './KellyPercentCard';
import { OptimalTradesCard } from './OptimalTradesCard';
import { MaxDrawdownCard } from './MaxDrawdownCard';
import { ExpectancyCard } from './ExpectancyCard';
import { RoiCard } from './RoiCard';
import { CumulativeEquityChart } from './CumulativeEquityChart';
import { DrawdownChart } from './DrawdownChart';
import { HoldingsHistogram } from './HoldingsHistogram';
import { ReturnScatterChart } from './ReturnScatterChart';
import { PnLCalendar } from './PnLCalendar';

// Mock/sample data for charts
const mockEquityData = [
  { date: '2023-01-01', value: 1000000 },
  { date: '2023-02-01', value: 1050000 },
  { date: '2023-03-01', value: 1100000 },
  { date: '2023-04-01', value: 1150000 },
  { date: '2023-05-01', value: 1247862 },
];
const mockDrawdownData = [
  { date: '2023-01-01', value: 0 },
  { date: '2023-02-01', value: -2 },
  { date: '2023-03-01', value: -5 },
  { date: '2023-04-01', value: -3 },
  { date: '2023-05-01', value: -12.47 },
];
const mockHistogramData = [
  { r: '-3', value: 2 },
  { r: '-2', value: 5 },
  { r: '-1', value: 8 },
  { r: '0', value: 10 },
  { r: '1', value: 15 },
  { r: '2', value: 12 },
  { r: '3', value: 7 },
];
const mockScatterData = [
  { x: 1, y: 2, z: 100, ticker: 'AAPL' },
  { x: 2, y: 3, z: 200, ticker: 'TSLA' },
  { x: 3, y: -1, z: 150, ticker: 'GOOG' },
  { x: 4, y: 4, z: 300, ticker: 'MSFT' },
  { x: 5, y: -2, z: 120, ticker: 'AMZN' },
];
const mockPnLCalendarData = {
  '2023-05-01': 2.1,
  '2023-05-02': -1.2,
  '2023-05-03': 0.5,
  '2023-05-04': 1.8,
  '2023-05-05': -0.7,
  '2023-05-06': 0,
  '2023-05-07': 1.1,
  '2023-05-08': 2.3,
  '2023-05-09': -1.5,
  '2023-05-10': 0.9,
  '2023-05-11': 1.2,
  '2023-05-12': -0.3,
  '2023-05-13': 0.4,
  '2023-05-14': 1.7,
  '2023-05-15': -0.8,
  '2023-05-16': 0.6,
  '2023-05-17': 2.0,
  '2023-05-18': -1.1,
  '2023-05-19': 0.7,
  '2023-05-20': 1.5,
  '2023-05-21': -0.2,
  '2023-05-22': 0.3,
  '2023-05-23': 1.9,
  '2023-05-24': -0.6,
  '2023-05-25': 0.8,
  '2023-05-26': 1.4,
  '2023-05-27': -0.4,
  '2023-05-28': 0.2,
  '2023-05-29': 1.6,
  '2023-05-30': -0.9,
  '2023-05-31': 0.5,
};

import Button from '@mui/material/Button';
import { useAppStore } from '../../stores/appStore';

export function Dashboard() {
  const [unrealizedPnl, setUnrealizedPnl] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { navigateTo } = useAppStore();

  useEffect(() => {
    let intervalId: number | null = null;
    let isMounted = true;
    async function fetchUnrealizedPnl() {
      if (!isMounted) return;
      setLoading(true);
      setError(null);
      try {
        if (window.electronAPI?.getTrades) {
          const trades = await window.electronAPI.getTrades();
          const sum = trades.reduce((acc: number, t: unknown) => {
            if (t && typeof t === 'object' && 'unrealized_pnl' in t && typeof (t as { unrealized_pnl?: number }).unrealized_pnl === 'number') {
              return acc + (t as { unrealized_pnl: number }).unrealized_pnl;
            }
            return acc;
          }, 0);
          if (isMounted) setUnrealizedPnl(sum);
        } else {
          if (isMounted) setUnrealizedPnl(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch trades');
          setUnrealizedPnl(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchUnrealizedPnl();
    intervalId = setInterval(fetchUnrealizedPnl, 60000);
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      {/* Dashboard Action Buttons */}
      <div className="flex gap-2.5 justify-center mt-5 mb-8">
        <Button
          variant="contained"
          color="primary"
          sx={{ borderRadius: (theme) => theme.shape.borderRadius, px: 3, py: 1.5, fontWeight: 600 }}
          onClick={() => navigateTo('logTransactionForm', { navTimestamp: Date.now() })}
        >
          Log New Transaction
        </Button>
        <Button
          variant="outlined"
          color="primary"
          sx={{ borderRadius: (theme) => theme.shape.borderRadius, px: 3, py: 1.5, fontWeight: 600 }}
          onClick={() => navigateTo('tradesList')}
        >
          View All Trades
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          sx={{ borderRadius: (theme) => theme.shape.borderRadius, px: 3, py: 1.5, fontWeight: 600 }}
          onClick={() => navigateTo('analyticsPage')}
        >
          View Analytics
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Top Row - Main Stat Cards */}
        <div className="col-span-4"><NetBalanceCard /></div>
      <div className="col-span-4">
        {loading ? (
          <MetricCard title="Unrealized P&L" size="sm" status="default" className="order-2">
            <div className="flex flex-col items-center justify-center min-h-[64px]">
              <span className="text-gray-400 text-lg">Loading...</span>
            </div>
          </MetricCard>
        ) : error ? (
          <MetricCard title="Unrealized P&L" size="sm" status="default" className="order-2">
            <div className="flex flex-col items-center justify-center min-h-[64px]">
              <span className="text-red-400 text-lg">Error</span>
            </div>
          </MetricCard>
        ) : (
          <UnrealizedPnLCard value={typeof unrealizedPnl === 'number' ? unrealizedPnl : 0} />
        )}
      </div>
      <div className="col-span-4"><BuyingPowerCard /></div>

      {/* Second Row - Performance Stat Cards */}
      <div className="col-span-3"><SharpeRatioCard /></div>
      <div className="col-span-3"><SortinoRatioCard /></div>
      <div className="col-span-3"><ProfitFactorCard /></div>
      <div className="col-span-3"><KellyPercentCard /></div>

      {/* Third Row - Trade Stat Cards */}
      <div className="col-span-3"><OptimalTradesCard /></div>
      <div className="col-span-3"><MaxDrawdownCard /></div>
      <div className="col-span-3"><ExpectancyCard value={3241.56} /></div>
      <div className="col-span-3"><RoiCard value={18.7} /></div>

      {/* Fourth Row - Charts */}
      <div className="col-span-6"><MetricCard title="Cumulative Equity Curve"><CumulativeEquityChart data={mockEquityData} /></MetricCard></div>
      <div className="col-span-6"><MetricCard title="Drawdown Curve"><DrawdownChart data={mockDrawdownData} /></MetricCard></div>

      {/* Fifth Row - More Charts */}
      <div className="col-span-4"><MetricCard title="R-Multiple Histogram (Last 100 Trades)"><HoldingsHistogram data={mockHistogramData} /></MetricCard></div>
      <div className="col-span-4"><MetricCard title="Return vs Risk Scatter"><ReturnScatterChart data={mockScatterData} /></MetricCard></div>
      <div className="col-span-4"><MetricCard title="30-Day P&L Heatmap Calendar"><PnLCalendar data={mockPnLCalendarData} /></MetricCard></div>
    </div>
    </>
  );
}
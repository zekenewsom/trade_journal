import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { colors } from '../../styles/design-tokens';

interface NetBalanceCardProps {
  value: number;
  change: number;
  changePercentage: number;
  history: { t: string; v: number }[];
}

export function NetBalanceCard({ 
  value = 1247862.34, 
  change = 39825.12, 
  changePercentage = 3.09, 
  history = [] 
}: Partial<NetBalanceCardProps>) {
  // Using mock data if not provided
  const mockHistory = history.length > 0 ? history : [
    { t: '2023-01', v: 1100000 },
    { t: '2023-02', v: 1150000 },
    { t: '2023-03', v: 1100000 },
    { t: '2023-04', v: 1200000 },
    { t: '2023-05', v: 1180000 },
    { t: '2023-06', v: 1250000 },
    { t: '2023-07', v: 1247862 }
  ];
  
  const isPositive = change >= 0;
  const changeColor = isPositive ? colors.success : colors.error;
  const changePrefix = isPositive ? '+' : '';

  return (
    <MetricCard title="Net Account Balance" size="lg" status={isPositive ? 'good' : 'bad'}>
      <div className="flex flex-col gap-1">
        <div className="text-3xl font-semibold font-mono">
          $<CountUp end={value} separator="," decimals={2} preserveValue />
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: changeColor }}>
          <span>{changePrefix}${Math.abs(change).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          <span>({changePrefix}{Math.abs(changePercentage).toFixed(2)}%)</span>
        </div>
      </div>
      
      <div className="h-14 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockHistory}>
            <Line 
              type="monotone" 
              dataKey="v" 
              stroke={colors.primary} 
              strokeWidth={2} 
              dot={false} 
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </MetricCard>
  );
} 
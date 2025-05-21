import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { colors } from '../../styles/design-tokens';

interface SharpeDailyCardProps {
  value: number;
}

export function SharpeDailyCard({
  value = 4.32
}: Partial<SharpeDailyCardProps>) {
  // Determine color based on value
  const getStatusColor = () => {
    if (value >= 4) return colors.success;
    if (value >= 2) return colors.warning;
    return colors.error;
  };
  
  return (
    <MetricCard title="Daily Sharpe">
      <div className="flex flex-col h-full justify-between">
        <div className="text-2xl font-semibold font-mono" style={{ color: getStatusColor() }}>
          <CountUp end={value} decimals={2} preserveValue />
        </div>
        
        <div className="text-xs mt-2" style={{ color: colors.textSecondary }}>
          {value >= 4 ? 'Excellent' : value >= 2 ? 'Good' : value >= 1 ? 'Moderate' : 'Poor'}
        </div>
      </div>
    </MetricCard>
  );
} 
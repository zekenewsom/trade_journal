import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';

interface SharpeDailyCardProps {
  value: number;
}

export function SharpeDailyCard({
  value = 4.32
}: Partial<SharpeDailyCardProps>) {
  // Determine color based on value
  const getStatusColor = () => {
    if (value >= 4) return 'text-positive';
    if (value >= 2) return 'text-warning';
    return 'text-negative';
  };
  
  return (
    <MetricCard title="Daily Sharpe">
      <div className="flex flex-col h-full justify-between">
        <div className={`text-2xl font-semibold font-mono ${getStatusColor()}`}>
          <CountUp end={value} decimals={2} preserveValue />
        </div>
        
        <div className="text-xs text-gray-400 mt-2">
          {value >= 4 ? 'Excellent' : value >= 2 ? 'Good' : value >= 1 ? 'Moderate' : 'Poor'}
        </div>
      </div>
    </MetricCard>
  );
} 
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';

interface UnrealizedPnLCardProps {
  value: number;
}

export function UnrealizedPnLCard({ value }: UnrealizedPnLCardProps) {
  const isPositive = value >= 0;
  
  return (
    <MetricCard 
      title="Unrealized P&L" 
      size="sm"
      status={isPositive ? 'good' : 'bad'}
      className="order-2"
    >
      <div className="flex flex-col">
        <div className={`text-2xl font-semibold font-mono ${isPositive ? 'text-positive' : 'text-negative'}`}>
          {isPositive ? '+' : ''}<CountUp end={value} separator="," decimal="." decimals={2} duration={1} prefix="$" />
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Mark-to-market value
        </div>
      </div>
    </MetricCard>
  );
} 
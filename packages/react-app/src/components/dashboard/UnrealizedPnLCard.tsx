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
      className="bg-white order-2"
      status={isPositive ? 'good' : 'bad'}
    >
      <div className="flex flex-col">
        <div className={`text-2xl font-semibold font-mono text-primary ${isPositive ? 'text-green-600' : 'text-error'}`}>
          {isPositive ? '+' : ''}<CountUp end={value} separator="," decimal="." decimals={2} duration={1} prefix="$" />
        </div>
        <div className="text-xs mt-1 text-secondary">
          Mark-to-market value
        </div>
      </div>
    </MetricCard>
  );
} 
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { ArrowUp } from 'lucide-react';

interface UnrealisedPnLCardProps {
  value: number;
  change: number;
  changePercentage: number;
}

export function UnrealisedPnLCard({
  value = 47892.21,
  change = 3200.21,
  changePercentage = 7.15
}: Partial<UnrealisedPnLCardProps>) {
  const isPositive = value >= 0;
  
  return (
    <MetricCard title="Unrealised P&L" status={isPositive ? 'good' : 'bad'} className="bg-white">
      <div className="flex flex-col">
        <div className={`text-2xl font-semibold font-mono ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}
          $<CountUp end={value} separator="," decimals={2} preserveValue />
        </div>
        
        {change !== 0 && (
          <div className="flex items-center gap-1.5 mt-1 text-xs text-secondary">
            <span>vs previous day:</span>
            <div className="text-xs mt-1 text-secondary">
              Mark-to-market value
            </div>
            <ArrowUp size={10} className={`text-${isPositive ? 'green' : 'red'}-600`} style={{ transform: isPositive ? undefined : 'rotate(180deg)' }} />
            <span className={`text-${isPositive ? 'green' : 'red'}-600`}>
              {Math.abs(changePercentage).toFixed(2)}%
            </span>
          </div>
        )}
        
        <div className="mt-2">
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-gray-200">
            <div 
              className="h-full"
              style={{ width: `${Math.min(Math.abs(changePercentage) * 4, 100)}%`, background: isPositive ? 'green' : 'red' }}
            />
          </div>
        </div>
      </div>
    </MetricCard>
  );
} 
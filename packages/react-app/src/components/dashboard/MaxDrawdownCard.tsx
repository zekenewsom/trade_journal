import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';

interface MaxDrawdownCardProps {
  value: number;
  amountLost: number;
}

export function MaxDrawdownCard({
  value = -12.47,
  amountLost = 156483.48
}: Partial<MaxDrawdownCardProps>) {
  // Drawdown is always shown as negative, so we need to ensure the value is negative
  const drawdownValue = value <= 0 ? value : -value;
  
  return (
    <MetricCard title="Max Historical Drawdown" status="bad">
      <div className="flex flex-col">
        <div className="text-2xl font-semibold font-mono text-negative">
          <CountUp end={drawdownValue} decimals={2} preserveValue suffix="%" />
        </div>
        
        <div className="text-sm text-gray-400 mt-1">
          <span className="text-negative">${Math.abs(amountLost).toLocaleString()}</span> lost
        </div>
        
        <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden mt-2">
          <div 
            className="h-full bg-negative"
            // Assuming -25% is a full bar, scale accordingly
            style={{ width: `${Math.min(Math.abs(drawdownValue) / 25 * 100, 100)}%` }}
          />
        </div>
      </div>
    </MetricCard>
  );
} 
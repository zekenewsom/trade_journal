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
        <div className="text-2xl font-semibold font-mono text-red-500">
          <CountUp end={drawdownValue} decimals={2} preserveValue suffix="%" />
        </div>
        
        <div className="text-sm mt-1 text-gray-500 dark:text-gray-400">
          <span className="text-red-500">${Math.abs(amountLost).toLocaleString()}</span> lost
        </div>
        
        <div className="w-full h-1.5 rounded-full overflow-hidden mt-2 bg-gray-200 dark:bg-gray-700">
          <div 
            className="h-full bg-red-500"
            style={{ width: `${Math.min(Math.abs(drawdownValue) / 25 * 100, 100)}%` }}
          />
        </div>
      </div>
    </MetricCard>
  );
} 
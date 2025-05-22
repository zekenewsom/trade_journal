import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';


interface KellyPercentCardProps {
  value: number;
  status: 'good' | 'moderate' | 'bad';
}

export function KellyPercentCard({
  value = 18.7,
  status = 'good'
}: Partial<KellyPercentCardProps>) {

  // Calculate ratio for the progress bar (Kelly % usually ranges from 0-30)
  const ratio = Math.min(value / 30, 1) * 100;
  
  return (
    <MetricCard title="Kelly %" status={status}>
      <div className="flex flex-col">
        <div className="text-2xl font-semibold font-mono text-primary">
          <CountUp end={value} decimals={1} preserveValue suffix="%" />
        </div>
        
        <div className="w-full h-1 rounded-full mt-2 bg-gray-200">
          <div
            className="rounded-full bg-blue-500"
            style={{ width: `${ratio}%`, height: '100%' }}
          />
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <div className="text-xs text-secondary">Conservative</div>
          <div className="text-xs text-secondary">Aggressive</div>
        </div>
      </div>
    </MetricCard>
  );
}
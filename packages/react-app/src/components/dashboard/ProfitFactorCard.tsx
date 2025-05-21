import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';


interface ProfitFactorCardProps {
  value: number;
  status: 'good' | 'moderate' | 'bad';
}

export function ProfitFactorCard({ 
  value = 2.12,
  status = 'good'
}: Partial<ProfitFactorCardProps>) {
  // Calculate the ratio for the progress bar (a profit factor of 3+ is typically excellent)
  const ratio = Math.min(value / 3, 1) * 100;
  
  return (
    <MetricCard title="Profit Factor" status={status}>
      <div className="flex flex-col">
        <div className="text-2xl font-semibold font-mono text-primary">
          <CountUp end={value} decimals={2} preserveValue />
        </div>
        
        <div className="flex items-center justify-between mt-1 mb-1">
          <div className="text-xs text-secondary">Poor</div>
          <div className="text-xs text-secondary">Good</div>
        </div>
        
        <div className="w-full h-1 rounded-full bg-gray-200">
          <div
            className={
              `h-1 rounded-full ${status === 'good' ? 'bg-green-500' : status === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'}`
            }
            style={{ width: `${ratio}%` }}
          />
        </div>
      </div>
    </MetricCard>
  );
} 
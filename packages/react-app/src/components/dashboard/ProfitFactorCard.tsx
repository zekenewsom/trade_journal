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
        <div className="text-2xl font-semibold font-mono">
          <CountUp end={value} decimals={2} preserveValue />
        </div>
        
        <div className="flex items-center justify-between mt-1 mb-1">
          <div className="text-xs text-gray-400">Poor</div>
          <div className="text-xs text-gray-400">Good</div>
        </div>
        
        <div className="w-full h-1 bg-dark-700 rounded-full">
          <div 
            className={
              status === 'good' 
                ? 'bg-positive' 
                : status === 'moderate' 
                  ? 'bg-warning' 
                  : 'bg-negative'
            }
            style={{ width: `${ratio}%`, height: '100%', borderRadius: '9999px' }}
          />
        </div>
      </div>
    </MetricCard>
  );
} 
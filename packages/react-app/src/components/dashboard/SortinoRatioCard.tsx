import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';

interface SortinoRatioCardProps {
  value: number;
  status: 'excellent' | 'good' | 'moderate' | 'bad';
}

export function SortinoRatioCard({
  value = 3.14,
  status = 'good'
}: Partial<SortinoRatioCardProps>) {
  // Calculate the ratio for the progress bar (assuming good > 2, moderate 1-2, bad < 1)
  const ratio = Math.min(value / 5, 1) * 100;
  
  return (
    <MetricCard title="Sortino Ratio" status="good">
      <div className="flex flex-col">
        <div className="text-2xl font-semibold font-mono">
          <CountUp end={value} decimals={2} preserveValue />
        </div>
        
        <div className="flex items-center justify-between mt-1 mb-1">
          <div className="text-xs text-gray-400">Poor</div>
          <div className="text-xs text-gray-400">Excellent</div>
        </div>
        
        <div className="w-full h-1 bg-dark-700 rounded-full">
          <div 
            className={
              status === 'excellent' || status === 'good'
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
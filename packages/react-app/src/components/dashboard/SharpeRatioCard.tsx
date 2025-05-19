import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';

interface SharpeRatioCardProps {
  value: number;
  status: 'good' | 'moderate' | 'bad';
}

export function SharpeRatioCard({
  value = 2.37,
  status = 'good'
}: Partial<SharpeRatioCardProps>) {
  // Calculate the ratio for the progress bar (assuming good > 2, moderate 1-2, bad < 1)
  const ratio = Math.min(value / 4, 1) * 100;
  
  return (
    <MetricCard title="Sharpe Ratio (YTD)" status={status}>
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
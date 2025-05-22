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
    <MetricCard title="Sortino Ratio" status="good" className="bg-white">
      <div className="flex flex-col">
        <div className="text-2xl font-semibold font-mono text-primary">
          <CountUp end={value} decimals={2} preserveValue />
        </div>
        
        <div className="flex items-center justify-between mt-1 mb-1">
          <div className="text-xs text-secondary">Poor</div>
          <div className="text-xs text-secondary">Excellent</div>
        </div>
        
        <div className="w-full h-1 rounded-full bg-gray-200">
          <div
            style={{ width: `${ratio}%`, height: '100%', borderRadius: '9999px', background: status === 'excellent' || status === 'good' ? 'green' : status === 'moderate' ? 'yellow' : 'red' }}
          />
        </div>
      </div>
    </MetricCard>
  );
}
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import clsx from 'clsx';

interface RoiCardProps {
  value: number; // ROI as a percentage
}

export function RoiCard({ value }: RoiCardProps) {
  // Determine status based on ROI value
  const getStatus = () => {
    if (value >= 15) return 'good';
    if (value >= 5) return 'moderate';
    if (value < 0) return 'bad';
    return 'default';
  };
  
  return (
    <MetricCard 
      title="ROI %" 
      size="sm"
      status={getStatus()}
      className="bg-white"
    >
      <div className="flex flex-col">
        <div className={clsx('text-2xl font-semibold font-mono text-primary')}>
          {value >= 0 ? '+' : ''}<CountUp end={value} decimals={1} duration={1} suffix="%" />
        </div>
        
        <div className="flex gap-1 mt-2">
          <div className={clsx('h-1.5 rounded-sm', value >= 0 ? 'bg-white' : 'bg-gray-200')} style={{ width: '10%' }}></div>
          <div className={clsx('h-1.5 rounded-sm', value >= 5 ? 'bg-white' : 'bg-gray-200')} style={{ width: '20%' }}></div>
          <div className={clsx('h-1.5 rounded-sm', value >= 10 ? 'bg-white' : 'bg-gray-200')} style={{ width: '30%' }}></div>
          <div className={clsx('h-1.5 rounded-sm', value >= 15 ? 'bg-white' : 'bg-gray-200')} style={{ width: '40%' }}></div>
        </div>
      </div>
    </MetricCard>
  );
} 
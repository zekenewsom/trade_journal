import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';

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
    >
      <div className="flex flex-col">
        <div className={`text-2xl font-semibold ${value >= 0 ? 'text-positive' : 'text-negative'}`}>
          {value >= 0 ? '+' : ''}<CountUp end={value} decimals={1} duration={1} suffix="%" />
        </div>
        
        <div className="flex gap-1 mt-2">
          <div className={`h-1.5 rounded-sm ${value >= 0 ? 'bg-positive/30' : 'bg-negative/30'}`} 
               style={{ width: '10%' }}></div>
          <div className={`h-1.5 rounded-sm ${value >= 5 ? 'bg-positive/50' : 'bg-dark-500'}`} 
               style={{ width: '20%' }}></div>
          <div className={`h-1.5 rounded-sm ${value >= 10 ? 'bg-positive/70' : 'bg-dark-500'}`} 
               style={{ width: '30%' }}></div>
          <div className={`h-1.5 rounded-sm ${value >= 15 ? 'bg-positive' : 'bg-dark-500'}`} 
               style={{ width: '40%' }}></div>
        </div>
      </div>
    </MetricCard>
  );
} 
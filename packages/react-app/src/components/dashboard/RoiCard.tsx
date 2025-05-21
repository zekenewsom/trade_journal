import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { colors } from '../../styles/design-tokens';

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
        <div className="text-2xl font-semibold font-mono" style={{ color: value >= 0 ? colors.success : colors.error }}>
          {value >= 0 ? '+' : ''}<CountUp end={value} decimals={1} duration={1} suffix="%" />
        </div>
        
        <div className="flex gap-1 mt-2">
          <div className="h-1.5 rounded-sm" style={{ width: '10%', background: value >= 0 ? colors.success + '33' : colors.error + '33' }}></div>
          <div className="h-1.5 rounded-sm" style={{ width: '20%', background: value >= 5 ? colors.success + '80' : colors.cardStroke }}></div>
          <div className="h-1.5 rounded-sm" style={{ width: '30%', background: value >= 10 ? colors.success + 'B3' : colors.cardStroke }}></div>
          <div className="h-1.5 rounded-sm" style={{ width: '40%', background: value >= 15 ? colors.success : colors.cardStroke }}></div>
        </div>
      </div>
    </MetricCard>
  );
} 
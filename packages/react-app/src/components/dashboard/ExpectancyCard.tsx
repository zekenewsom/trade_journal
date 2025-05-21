import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { colors } from '../../styles/design-tokens';

interface ExpectancyCardProps {
  value: number; // Expectancy value in USD
}

export function ExpectancyCard({ value }: ExpectancyCardProps) {
  const getStatus = () => {
    if (value >= 2000) return 'good';
    if (value >= 500) return 'moderate';
    if (value <= 0) return 'bad';
    return 'default';
  };
  
  return (
    <MetricCard 
      title="Expectancy (R*Trade)" 
      size="sm"
      status={getStatus()}
    >
      <div className="flex flex-col">
        <div className="text-2xl font-semibold font-mono" style={{ color: value >= 0 ? colors.success : colors.error }}>
          {value >= 0 ? '+' : ''}<CountUp end={value} separator="," decimal="." decimals={2} duration={1} prefix="$" />
        </div>
        
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs" style={{ color: colors.textSecondary }}>Per trade profit/loss</span>
          <span className="text-xs font-medium" style={{ color: value >= 0 ? colors.success : colors.error }}>
            {value >= 500 ? 'Strong' : value >= 0 ? 'Profitable' : 'Unprofitable'}
          </span>
        </div>
      </div>
    </MetricCard>
  );
} 
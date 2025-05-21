import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { colors } from '../../styles/design-tokens';

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
          <div className="text-xs" style={{ color: colors.textSecondary }}>Poor</div>
          <div className="text-xs" style={{ color: colors.textSecondary }}>Good</div>
        </div>
        
        <div className="w-full h-1 rounded-full" style={{ background: colors.cardStroke }}>
          <div 
            style={{ 
              width: `${ratio}%`, 
              height: '100%', 
              borderRadius: '9999px', 
              background: status === 'good' 
                ? colors.success 
                : status === 'moderate' 
                  ? colors.warning 
                  : colors.error 
            }}
          />
        </div>
      </div>
    </MetricCard>
  );
} 
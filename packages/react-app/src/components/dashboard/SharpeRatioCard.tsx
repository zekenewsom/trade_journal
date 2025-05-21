import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { colors } from '../../styles/design-tokens';

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
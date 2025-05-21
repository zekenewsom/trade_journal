import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { colors } from '../../styles/design-tokens';

interface KellyPercentCardProps {
  value: number;
  status: 'good' | 'moderate' | 'bad';
}

export function KellyPercentCard({
  value = 18.7,
  status = 'good'
}: Partial<KellyPercentCardProps>) {
  // Calculate ratio for the progress bar (Kelly % usually ranges from 0-30)
  const ratio = Math.min(value / 30, 1) * 100;
  
  return (
    <MetricCard title="Kelly %" status={status}>
      <div className="flex flex-col">
        <div className="text-2xl font-semibold font-mono">
          <CountUp end={value} decimals={1} preserveValue suffix="%" />
        </div>
        
        <div className="w-full h-1 rounded-full mt-2" style={{ background: colors.cardStroke }}>
          <div 
            className=""
            style={{ width: `${ratio}%`, height: '100%', borderRadius: '9999px', background: colors.primary }}
          />
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <div className="text-xs" style={{ color: colors.textSecondary }}>Conservative</div>
          <div className="text-xs" style={{ color: colors.textSecondary }}>Aggressive</div>
        </div>
      </div>
    </MetricCard>
  );
} 
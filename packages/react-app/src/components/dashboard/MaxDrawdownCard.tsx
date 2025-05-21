import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { colors } from '../../styles/design-tokens';

interface MaxDrawdownCardProps {
  value: number;
  amountLost: number;
}

export function MaxDrawdownCard({
  value = -12.47,
  amountLost = 156483.48
}: Partial<MaxDrawdownCardProps>) {
  // Drawdown is always shown as negative, so we need to ensure the value is negative
  const drawdownValue = value <= 0 ? value : -value;
  
  return (
    <MetricCard title="Max Historical Drawdown" status="bad">
      <div className="flex flex-col">
        <div className="text-2xl font-semibold font-mono" style={{ color: colors.error }}>
          <CountUp end={drawdownValue} decimals={2} preserveValue suffix="%" />
        </div>
        
        <div className="text-sm mt-1" style={{ color: colors.textSecondary }}>
          <span style={{ color: colors.error }}>${Math.abs(amountLost).toLocaleString()}</span> lost
        </div>
        
        <div className="w-full h-1.5 rounded-full overflow-hidden mt-2" style={{ background: colors.cardStroke }}>
          <div 
            className="h-full"
            // Assuming -25% is a full bar, scale accordingly
            style={{ width: `${Math.min(Math.abs(drawdownValue) / 25 * 100, 100)}%`, background: colors.error }}
          />
        </div>
      </div>
    </MetricCard>
  );
} 
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { colors } from '../../styles/design-tokens';

interface UnrealizedPnLCardProps {
  value: number;
}

export function UnrealizedPnLCard({ value }: UnrealizedPnLCardProps) {
  const isPositive = value >= 0;
  
  return (
    <MetricCard 
      title="Unrealized P&L" 
      size="sm"
      status={isPositive ? 'good' : 'bad'}
      className="order-2"
    >
      <div className="flex flex-col">
        <div className="text-2xl font-semibold font-mono" style={{ color: isPositive ? colors.success : colors.error }}>
          {isPositive ? '+' : ''}<CountUp end={value} separator="," decimal="." decimals={2} duration={1} prefix="$" />
        </div>
        <div className="text-xs mt-1" style={{ color: colors.textSecondary }}>
          Mark-to-market value
        </div>
      </div>
    </MetricCard>
  );
} 
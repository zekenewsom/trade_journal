import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { ArrowUp } from 'lucide-react';
import { colors } from '../../styles/design-tokens';

interface UnrealisedPnLCardProps {
  value: number;
  change: number;
  changePercentage: number;
}

export function UnrealisedPnLCard({
  value = 47892.21,
  change = 3200.21,
  changePercentage = 7.15
}: Partial<UnrealisedPnLCardProps>) {
  const isPositive = value >= 0;
  const statusColor = isPositive ? 'good' : 'bad';
  const mainColor = isPositive ? colors.success : colors.error;
  
  return (
    <MetricCard title="Unrealised P&L" status={statusColor}>
      <div className="flex flex-col">
        <div className="text-2xl font-semibold font-mono" style={{ color: mainColor }}>
          {isPositive ? '+' : ''}
          $<CountUp end={value} separator="," decimals={2} preserveValue />
        </div>
        
        {change !== 0 && (
          <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: colors.textSecondary }}>
            <span>vs previous day:</span>
            <div className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              Mark-to-market value
            </div>
            <ArrowUp size={10} style={{ color: mainColor, transform: isPositive ? undefined : 'rotate(180deg)' }} />
            <span style={{ color: mainColor }}>
              {Math.abs(changePercentage).toFixed(2)}%
            </span>
          </div>
        )}
        
        <div className="mt-2">
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: colors.cardStroke }}>
            <div 
              className="h-full"
              style={{ width: `${Math.min(Math.abs(changePercentage) * 4, 100)}%`, background: mainColor }}
            />
          </div>
        </div>
      </div>
    </MetricCard>
  );
} 
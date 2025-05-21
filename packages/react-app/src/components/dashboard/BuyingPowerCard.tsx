import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { colors } from '../../styles/design-tokens';

interface BuyingPowerCardProps {
  value: number;
  allocation: number;
}

export function BuyingPowerCard({
  value = 823571.08,
  allocation = 64
}: Partial<BuyingPowerCardProps>) {
  return (
    <MetricCard title="Available Buying Power">
      <div className="flex flex-col">
        <div className="text-2xl font-semibold font-mono">
          $<CountUp end={value} separator="," decimals={2} preserveValue />
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs" style={{ color: colors.textSecondary }}>
            <span className="mr-1">Allocation:</span>
            <span className="font-medium" style={{ color: colors.onSurface }}>{allocation}%</span>
          </div>
          
          <div className="text-xs" style={{ color: colors.textSecondary }}>
            <span className="mr-1">Free:</span>
            <span className="font-medium" style={{ color: colors.onSurface }}>{100 - allocation}%</span>
          </div>
        </div>
        
        <div className="mt-1">
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: colors.cardStroke }}>
            <div 
              className="h-full"
              style={{ width: `${allocation}%`, background: colors.primary }}
            />
          </div>
        </div>
      </div>
    </MetricCard>
  );
} 
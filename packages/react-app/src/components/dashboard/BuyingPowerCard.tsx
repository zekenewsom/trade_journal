import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';

interface BuyingPowerCardProps {
  value: number;
  allocation: number;
}

import { useAppStore } from '../../stores/appStore';

export function BuyingPowerCard({
  allocation = 64
}: Partial<BuyingPowerCardProps>) {
  // Get aggregated available buying power from the store
  const totalBuyingPower = useAppStore(s => s.getTotalBuyingPower());
  return (
    <MetricCard title="Available Buying Power" className="bg-white">
      <div className="flex flex-col">
        <div className="text-2xl font-semibold font-mono text-primary">
          $<CountUp end={totalBuyingPower} separator="," decimals={2} preserveValue />
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-secondary">
            <span className="mr-1">Allocation:</span>
            <span className="font-medium">{allocation}%</span>
          </div>
          
          <div className="text-xs text-secondary">
            <span className="mr-1">Free:</span>
            <span className="font-medium">{100 - allocation}%</span>
          </div>
        </div>
        
        <div className="mt-1">
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-gray-200">
            <div 
              className="h-full bg-primary"
              style={{ width: `${allocation}%` }}
            />
          </div>
        </div>
      </div>
    </MetricCard>
  );
} 
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';

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
          <div className="text-xs text-gray-400">
            <span className="mr-1">Allocation:</span>
            <span className="font-medium text-white">{allocation}%</span>
          </div>
          
          <div className="text-xs text-gray-400">
            <span className="mr-1">Free:</span>
            <span className="font-medium text-white">{100 - allocation}%</span>
          </div>
        </div>
        
        <div className="mt-1">
          <div className="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden">
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
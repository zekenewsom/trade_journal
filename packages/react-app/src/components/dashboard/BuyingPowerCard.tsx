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
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span className="mr-1">Allocation:</span>
            <span className="font-medium text-gray-900 dark:text-white">{allocation}%</span>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span className="mr-1">Free:</span>
            <span className="font-medium text-gray-900 dark:text-white">{100 - allocation}%</span>
          </div>
        </div>
        
        <div className="mt-1">
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <div 
              className="h-full bg-blue-600 dark:bg-blue-400"
              style={{ width: `${allocation}%` }}
            />
          </div>
        </div>
      </div>
    </MetricCard>
  );
} 
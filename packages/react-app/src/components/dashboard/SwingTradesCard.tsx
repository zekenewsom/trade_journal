import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';

interface SwingTradesCardProps {
  value: number;
  totalTrades: number;
  profit: number;
}

export function SwingTradesCard({
  value = 24957.25,
  totalTrades = 56,
  profit = 14720.45
}: Partial<SwingTradesCardProps>) {
  // Calculate how much of the swing trades value is profit
  const profitPercentage = (profit / value) * 100;
  
  return (
    <MetricCard title="Swing Trades Total">
      <div className="flex flex-col">
        <div className="text-2xl font-semibold font-mono text-primary">
          $<CountUp end={value} separator="," decimals={2} preserveValue />
        </div>
        
        <div className="flex items-center text-xs gap-3 mt-2">
          <div className="px-2 py-1 rounded-md bg-gray-200">
            <span className="mr-1 text-secondary">Trades:</span>
            <span className="font-medium">{totalTrades}</span>
          </div>
          
          <div className="px-2 py-1 rounded-md bg-gray-200">
            <span className="mr-1 text-secondary">Profit:</span>
            <span className="font-medium text-green-600">{Math.round(profitPercentage)}%</span>
          </div>
        </div>
        
        <div className="w-full h-1.5 rounded-full overflow-hidden mt-2 bg-gray-200">
          <div
            className="h-full bg-primary"
            style={{ width: `${Math.min(profitPercentage, 100)}%` }}
          />
        </div>
      </div>
    </MetricCard>
  );
} 
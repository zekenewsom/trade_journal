import { useMemo } from 'react';
import { MetricCard } from '../ui/MetricCard';

interface PnLCalendarProps {
  data: Record<string, number>; // Day string -> PnL value
}

export function PnLCalendar({ data }: PnLCalendarProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Calculate value ranges for color mapping
  const values = Object.values(data);
  const maxGain = Math.max(...values.filter(v => v > 0), 0.01);
  const maxLoss = Math.abs(Math.min(...values.filter(v => v < 0), -0.01));
  
  // Get color class based on value
  const getColorClass = (value: number) => {
    if (value === 0) return 'bg-dark-500';
    
    const intensity = Math.min(Math.abs(value) / (value > 0 ? maxGain : maxLoss), 1);
    const alphaHex = Math.round(intensity * 255).toString(16).padStart(2, '0');
    
    if (value > 0) {
      return `bg-[#00E28A${alphaHex}]`;
    } else {
      return `bg-[#FF4D67${alphaHex}]`;
    }
  };
  
  return (
    <MetricCard title="30 Day P&L Heatmap Calendar" size="sm" className="col-span-3 row-span-2">
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {days.map(day => (
          <div key={day} className="text-center text-xs text-gray-400">
            {day}
          </div>
        ))}
        
        {/* Calendar cells */}
        {Object.entries(data).map(([day, value]) => (
          <div 
            key={day}
            className={`h-12 rounded flex flex-col items-center justify-center ${getColorClass(value)}`}
          >
            <div className="text-xs font-medium">{day.split('-')[2]}</div>
            <div className={`text-xs ${value > 0 ? 'text-positive' : value < 0 ? 'text-negative' : 'text-gray-400'}`}>
              {value > 0 ? '+' : value < 0 ? '-' : ''}${Math.abs(value).toFixed(1)}k
            </div>
          </div>
        ))}
      </div>
    </MetricCard>
  );
} 
import { MetricCard } from '../ui/MetricCard';
import { colors } from '../../styles/design-tokens';

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
    if (value === 0) return { background: colors.surface };

    const intensity = Math.min(Math.abs(value) / (value > 0 ? maxGain : maxLoss), 1);
    const alpha = intensity * 0.8; // Use 80% max opacity for color

    if (value > 0) {
      return { background: colors.success, opacity: alpha };
    } else {
      return { background: colors.error, opacity: alpha };
    }
  };
  
  return (
    <MetricCard title="30 Day P&L Heatmap Calendar" size="sm" className="col-span-3 row-span-2">
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {days.map(day => (
          <div key={day} className="text-center text-xs" style={{ color: colors.textSecondary }}>
            {day}
          </div>
        ))}
        
        {/* Calendar cells */}
        {Object.entries(data).map(([day, value]) => (
          <div 
            key={day}
            className="h-12 rounded flex flex-col items-center justify-center"
            style={getColorClass(value)}
          >
            <div className="text-xs" style={{ color: colors.textSecondary }}>{day.split('-')[2]}</div>
            <div className="text-xs" style={{ color: value > 0 ? colors.success : value < 0 ? colors.error : colors.textSecondary }}>
              {value > 0 ? '+' : value < 0 ? '-' : ''}${Math.abs(value).toFixed(1)}k
            </div>
          </div>
        ))}
      </div>
    </MetricCard>
  );
} 
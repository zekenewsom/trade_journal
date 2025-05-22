import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { useTheme } from '@mui/material/styles';

interface SharpeDailyCardProps {
  value: number;
}

export function SharpeDailyCard({
  value = 4.32
}: Partial<SharpeDailyCardProps>) {
  // Determine color based on value
  const theme = useTheme();
  const getStatusColor = () => {
    if (value >= 4) return theme.palette.success.main;
    if (value >= 2) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  return (
    <MetricCard title="Daily Sharpe" className="bg-white">
      <div className="flex flex-col h-full justify-between">
        <div className="text-2xl font-semibold font-mono text-primary" style={{ color: getStatusColor() }}>
          <CountUp end={value} decimals={2} preserveValue />
        </div>
        
        <div className="text-xs mt-2 text-secondary">
          {value >= 4 ? 'Excellent' : value >= 2 ? 'Good' : value >= 1 ? 'Moderate' : 'Poor'}
        </div>
      </div>
    </MetricCard>
  );
} 
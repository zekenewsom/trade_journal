import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { useTheme } from '@mui/material/styles';

interface SharpeRatioCardProps {
  value: number;
  status: 'good' | 'moderate' | 'bad';
}

export function SharpeRatioCard({
  value = 2.37,
  status = 'good'
}: Partial<SharpeRatioCardProps>) {
  // Calculate the ratio for the progress bar (assuming good > 2, moderate 1-2, bad < 1)
  const ratio = Math.min(value / 4, 1) * 100;
  
  const theme = useTheme();
  return (
    <MetricCard title="Sharpe Ratio (YTD)" status={status} className="bg-white">
      <div className="flex flex-col">
        <div className="text-2xl font-semibold font-mono text-primary">
          <CountUp end={value} decimals={2} preserveValue />
        </div>
        
        <div className="flex items-center justify-between mt-1 mb-1">
          <div className="text-xs text-secondary">Poor</div>
          <div className="text-xs text-secondary">Good</div>
        </div>
        
        <div className="w-full h-1 rounded-full bg-gray-200">
          <div 
            style={{ 
              width: `${ratio}%`, 
              height: '100%', 
              borderRadius: '9999px', 
              background: status === 'good' 
                ? theme.palette.success.main 
                : status === 'moderate' 
                  ? theme.palette.warning.main 
                  : theme.palette.error.main 
            }}
          />
        </div>
      </div>
    </MetricCard>
  );
} 
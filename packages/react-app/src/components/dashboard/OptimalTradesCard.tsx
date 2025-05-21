import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { AreaChart, Area, ResponsiveContainer, XAxis } from 'recharts';

interface OptimalTradesCardProps {
  value: number;
  change: number;
  data: { month: string; value: number }[];
}

export function OptimalTradesCard({
  value = 37428.18,
  change = -3.21,
  data = []
}: Partial<OptimalTradesCardProps>) {
  // Mock data for the chart
  const mockData = data.length > 0 ? data : [
    { month: 'Jan', value: 32000 },
    { month: 'Feb', value: 35000 },
    { month: 'Mar', value: 38000 },
    { month: 'Apr', value: 40000 },
    { month: 'May', value: 37428 },
  ];

  const isNegative = change < 0;
  
  return (
    <MetricCard title="Optimal Trades Gain" status={isNegative ? 'bad' : 'good'}>
      <div className="flex flex-col">
        <div className="text-2xl font-semibold font-mono">
          $<CountUp end={value} separator="," decimals={2} preserveValue />
        </div>
        
        <div className={`text-sm ${isNegative ? 'text-negative' : 'text-positive'}`}>
          {isNegative ? '' : '+'}
          {change}%
        </div>
        
        <div className="h-16 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData}>
              <defs>
                <linearGradient id="optimalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isNegative ? "#FF4D67" : "#00E28A"} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={isNegative ? "#FF4D67" : "#00E28A"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={isNegative ? "#FF4D67" : "#00E28A"} 
                fillOpacity={1}
                fill="url(#optimalGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MetricCard>
  );
} 
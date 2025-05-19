import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface EquityCurveChartProps {
  data?: { date: string; value: number }[];
}

export function EquityCurveChart({ data }: EquityCurveChartProps = {}) {
  // Mock data if not provided
  const mockData = data || [
    { date: 'Jan 1', value: 1000000 },
    { date: 'Jan 15', value: 1050000 },
    { date: 'Feb 1', value: 1080000 },
    { date: 'Feb 15', value: 1040000 },
    { date: 'Mar 1', value: 1100000 },
    { date: 'Mar 15', value: 1150000 },
    { date: 'Apr 1', value: 1180000 },
    { date: 'Apr 15', value: 1200000 },
    { date: 'May 1', value: 1247862 }
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockData}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3A7BFF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3A7BFF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A1B1D" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: '#1A1B1D' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: '#1A1B1D' }}
            tickLine={false}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0E0F11', borderColor: '#1A1B1D' }}
            itemStyle={{ color: '#ffffff' }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Balance']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3A7BFF" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, stroke: '#3A7BFF', strokeWidth: 2, fill: '#0E0F11' }}
            fillOpacity={1}
            fill="url(#equityGradient)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 
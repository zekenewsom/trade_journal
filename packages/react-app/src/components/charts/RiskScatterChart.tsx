import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ZAxis } from 'recharts';
import { colors } from '/src/styles/design-tokens';

interface RiskScatterChartProps {
  data?: { risk: number; return: number; size: number; ticker: string }[];
}

export function RiskScatterChart({ data }: RiskScatterChartProps = {}) {
  // Mock data if not provided
  const mockData = data || [
    { risk: 1.2, return: 2.5, size: 30000, ticker: 'AAPL' },
    { risk: 0.8, return: 1.2, size: 25000, ticker: 'MSFT' },
    { risk: 2.1, return: 3.1, size: 40000, ticker: 'AMZN' },
    { risk: 1.5, return: -0.8, size: 15000, ticker: 'META' },
    { risk: 0.5, return: 0.7, size: 10000, ticker: 'GOOGL' },
    { risk: 2.3, return: -1.2, size: 35000, ticker: 'TSLA' },
    { risk: 1.7, return: 2.1, size: 22000, ticker: 'NVDA' },
    { risk: 1.0, return: 1.5, size: 18000, ticker: 'AMD' },
    { risk: 0.3, return: 0.2, size: 5000, ticker: 'INTC' }
  ];

  // Split data into positive and negative returns
  const positiveData = mockData.filter(item => item.return >= 0);
  const negativeData = mockData.filter(item => item.return < 0);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.cardStroke} />
          <XAxis 
            type="number"
            dataKey="risk" 
            name="Risk"
            tick={{ fill: colors.textSecondary, fontSize: 12 }}
            axisLine={{ stroke: colors.cardStroke }}
            tickLine={false}
            label={{ value: 'Risk', position: 'insideBottom', offset: -10, fill: colors.textSecondary, fontSize: 12 }}
            domain={[0, 'dataMax']}
          />
          <YAxis 
            type="number"
            dataKey="return" 
            name="Return"
            tick={{ fill: colors.textSecondary, fontSize: 12 }}
            axisLine={{ stroke: colors.cardStroke }}
            tickLine={false}
            label={{ value: 'Return', angle: -90, position: 'insideLeft', fill: colors.textSecondary, fontSize: 12 }}
          />
          <ZAxis 
            type="number"
            dataKey="size" 
            range={[40, 160]}
            name="Position Size"
          />
          <Tooltip 
            contentStyle={{ backgroundColor: colors.background, borderColor: colors.cardStroke }}
            formatter={(value: number, name: string) => {
              if (name === 'Risk') return [`${value.toFixed(2)}`, name];
              if (name === 'Return') return [`${value.toFixed(2)}%`, name];
              if (name === 'Position Size') return [`$${value.toLocaleString()}`, name];
              return [value, name];
            }}
            cursor={{ strokeDasharray: '3 3' }}
            labelFormatter={(index) => mockData[index]?.ticker || ''}
          />
          <Scatter 
            name="Positive Returns" 
            data={positiveData} 
            fill={colors.success}
            fillOpacity={0.7}
          />
          <Scatter 
            name="Negative Returns" 
            data={negativeData} 
            fill={colors.error}
            fillOpacity={0.7}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
} 
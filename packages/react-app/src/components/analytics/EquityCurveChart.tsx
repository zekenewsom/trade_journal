import React, { useMemo } from 'react';
import { AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import type { EquityCurvePoint } from '../../types';


interface Props {
  equityCurve: EquityCurvePoint[];
}

const EquityCurveChart: React.FC<Props> = ({ equityCurve }: Props) => {
  const equityData = useMemo(() => {
    let peak = -Infinity;
    return equityCurve.map((point: EquityCurvePoint) => {
      if (point.equity > peak) {
        peak = point.equity;
      }
      return {
        ...point,
        peak,
        drawdown: ((point.equity - peak) / peak) * 100,
      };
    });
  }, [equityCurve]);

  if (!equityCurve || equityCurve.length === 0) {
    return <p>No equity curve data available.</p>;
  }

  return (
    <div>
      <h3 className="mb-4 text-xl font-semibold text-blue-600 dark:text-blue-400">Equity Curve & Drawdown</h3>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={equityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: '#6B7280' }}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis 
            yAxisId="equity"
            orientation="left"
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            tick={{ fontSize: 10, fill: '#6B7280' }}
          />
          <YAxis 
            yAxisId="drawdown"
            orientation="right"
            tickFormatter={(value) => `${value.toFixed(1)}%`}
            tick={{ fontSize: 10, fill: '#6B7280' }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'Equity') return [`$${value.toFixed(2)}`, 'Equity'];
              if (name === 'Drawdown') return [`${value.toFixed(2)}%`, 'Drawdown'];
              return [value, name];
            }}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
            contentStyle={{ 
              backgroundColor: '#F3F4F6',
              border: '1px solid #E5E7EB',
              borderRadius: '4px'
            }}
          />
          <Legend />
          <Area
            yAxisId="equity"
            type="monotone"
            dataKey="equity"
            name="Equity"
            stroke="#22C55E"
            fillOpacity={1}
            fill="url(#equityGradient)"
          />
          <Area
            yAxisId="drawdown"
            type="monotone"
            dataKey="drawdown"
            name="Drawdown"
            stroke="#EF4444"
            fillOpacity={1}
            fill="url(#drawdownGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EquityCurveChart; 
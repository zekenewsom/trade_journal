import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { EquityCurvePoint } from '../../types';

interface Props {
  equityCurve: EquityCurvePoint[];
}

const EquityCurveChart: React.FC<Props> = ({ equityCurve }) => {
  const { equityData, drawdownData } = useMemo(() => {
    let peak = -Infinity;
    const processedData = equityCurve.map(point => {
      if (point.equity > peak) {
        peak = point.equity;
      }
      const drawdown = peak > 0 ? ((point.equity - peak) / peak) * 100 : 0;
      return {
        ...point,
        drawdown,
        peak
      };
    });

    return {
      equityData: processedData,
      drawdownData: processedData.map(point => ({
        date: point.date,
        drawdown: point.drawdown
      }))
    };
  }, [equityCurve]);

  if (!equityCurve || equityCurve.length === 0) {
    return <p>No equity curve data available.</p>;
  }

  return (
    <div>
      <h3 style={{ color: '#61dafb', marginBottom: '15px' }}>Equity Curve & Drawdown</h3>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={equityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f44336" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f44336" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: '#ccc' }}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis 
            yAxisId="equity"
            orientation="left"
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            tick={{ fontSize: 10, fill: '#ccc' }}
          />
          <YAxis 
            yAxisId="drawdown"
            orientation="right"
            tickFormatter={(value) => `${value.toFixed(1)}%`}
            tick={{ fontSize: 10, fill: '#ccc' }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'Equity') return [`$${value.toFixed(2)}`, 'Equity'];
              if (name === 'Drawdown') return [`${value.toFixed(2)}%`, 'Drawdown'];
              return [value, name];
            }}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
            contentStyle={{ 
              backgroundColor: '#2a2f36',
              border: '1px solid #444',
              borderRadius: '4px'
            }}
          />
          <Legend />
          <Area
            yAxisId="equity"
            type="monotone"
            dataKey="equity"
            name="Equity"
            stroke="#82ca9d"
            fillOpacity={1}
            fill="url(#equityGradient)"
          />
          <Area
            yAxisId="drawdown"
            type="monotone"
            dataKey="drawdown"
            name="Drawdown"
            stroke="#f44336"
            fillOpacity={1}
            fill="url(#drawdownGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EquityCurveChart; 
import React, { useMemo } from 'react';
import { AreaChart, XAxis, YAxis, CartesianGrid, Area, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '@mui/material/styles';
import type { TooltipProps } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import type { EquityCurvePoint } from '../../types';

function useIsMobile() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 639px)').matches;
}

interface Props {
  equityCurve: EquityCurvePoint[];
}

const EquityCurveChart: React.FC<Props> = ({ equityCurve }: Props) => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  
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

  const renderTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 rounded shadow-lg bg-white border border-gray-200">
          <p className="text-xs text-gray-500">{new Date(label).toLocaleDateString()}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className={`text-sm font-medium ${entry.dataKey === 'equity' ? 'text-green-600' : 'text-red-600'}`}
            >
              {entry.dataKey === 'equity' ? `$${Number(entry.value).toFixed(2)}` : `${Number(entry.value).toFixed(2)}%`}
              {' '}
              {entry.dataKey === 'equity' ? 'Equity' : 'Drawdown'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!equityCurve || equityCurve.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-muted-foreground">No equity curve data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
      <AreaChart
        data={equityData}
        margin={{ top: 20, right: 60, left: 60, bottom: 60 }}
      >
        <defs>
          <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3} />
            <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.3} />
            <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis 
          dataKey="date" 
          tickFormatter={(value) => {
            const date = new Date(value);
            return isMobile ? date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : 
                             date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }}
          interval={Math.max(Math.floor(equityData.length / 6), 1)}
          tick={{ fontSize: 12, fill: theme.palette.text.primary }}
          axisLine={{ stroke: theme.palette.divider }}
          tickLine={{ stroke: theme.palette.divider }}
          angle={-45}
          textAnchor="end"
          height={70}
        />
        <YAxis 
          yAxisId="equity"
          orientation="left"
          tickFormatter={(value) => `$${Math.round(value)}`}
          tick={{ fontSize: 12, fill: theme.palette.text.primary }}
          axisLine={{ stroke: theme.palette.divider }}
          tickLine={{ stroke: theme.palette.divider }}
          width={50}
        />
        <YAxis 
          yAxisId="drawdown"
          orientation="right"
          tickFormatter={(value) => `${value.toFixed(1)}%`}
          tick={{ fontSize: 12, fill: theme.palette.text.primary }}
          axisLine={{ stroke: theme.palette.divider }}
          tickLine={{ stroke: theme.palette.divider }}
          width={50}
        />
        <Tooltip content={renderTooltip} />
        {!isMobile && (
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
        )}
        <Area
          yAxisId="equity"
          type="monotone"
          dataKey="equity"
          stroke={theme.palette.success.main}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#equityGradient)"
          name="Portfolio Equity"
        />
        <Area
          yAxisId="drawdown"
          type="monotone"
          dataKey="drawdown"
          stroke={theme.palette.error.main}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#drawdownGradient)"
          name="Drawdown %"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default EquityCurveChart;
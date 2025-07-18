import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

interface DrawdownChartProps {
  data: Array<{
    date: string;
    value: number;
  }>;
}

export function DrawdownChart({ data }: DrawdownChartProps) {
  const theme = useTheme();
  const renderTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 rounded shadow-lg bg-white border border-gray-200">
          <p className="text-xs text-secondary">{format(new Date(label), 'MMM d, yyyy')}</p>
          <p className="text-sm font-medium text-red-600">
            {Number(payload[0].value).toFixed(2)}% Drawdown
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate drawdown from equity data
  const drawdownData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Debug: Log the equity data
    console.log('Drawdown Chart - Equity Data:', data);
    
    let peak = data[0].value;
    const result = data.map(point => {
      // Update peak if current value is higher
      if (point.value > peak) {
        peak = point.value;
      }
      // Calculate drawdown as percentage decline from peak
      const drawdown = peak > 0 ? ((point.value - peak) / peak) * 100 : 0;
      return {
        ...point,
        drawdown: Math.min(drawdown, 0) // Ensure drawdown is always negative or zero
      };
    });
    
    console.log('Drawdown Chart - Calculated Drawdown:', result);
    return result;
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
      <AreaChart
        data={drawdownData}
        margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis
          dataKey="date"
          axisLine={{ stroke: theme.palette.divider }}
          tickLine={{ stroke: theme.palette.divider }}
          tickFormatter={(value) => format(new Date(value), 'MMM dd')}
          interval={Math.max(Math.floor(drawdownData.length / 5), 1)}
          tick={{ fontSize: 12, fill: theme.palette.text.primary }}
          angle={-45}
          textAnchor="end"
          height={70}
        />
        <YAxis
          axisLine={{ stroke: theme.palette.divider }}
          tickLine={{ stroke: theme.palette.divider }}
          tickFormatter={(value) => `${value.toFixed(1)}%`}
          tick={{ fontSize: 12, fill: theme.palette.text.primary }}
          domain={['auto', 0]}
          width={50}
        />
        <Tooltip content={renderTooltip} />
        <defs>
          <linearGradient id="drawdownChartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.3} />
            <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="drawdown"
          stroke={theme.palette.error.main}
          strokeWidth={2}
          fill="url(#drawdownChartGradient)"
          fillOpacity={1}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
} 
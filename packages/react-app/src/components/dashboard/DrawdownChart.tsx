import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'; // Legend import not present, nothing to remove.
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
          <p className="text-sm font-medium text-primary">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => format(new Date(value), 'MMM')}
            tick={{ fontSize: 10, fill: 'var(--color-on-surface-variant)' }}
          />
          <YAxis
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 10, fill: 'var(--color-on-surface-variant)' }}
            domain={['auto', 0]}
          />
          <Tooltip content={renderTooltip} />
          <defs>
            <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.1} />
              <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={theme.palette.error.main}
            strokeWidth={2}
            fill="url(#drawdownGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
} 
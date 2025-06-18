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

import { colors } from '../../styles/design-tokens';
import { format } from 'date-fns';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

interface CumulativeEquityChartProps {
  data: Array<{
    date: string;
    value: number;
  }>;
}

export function CumulativeEquityChart({ data }: CumulativeEquityChartProps) {
  const renderTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: colors.surface, border: `1px solid ${colors.cardStroke}` }} className="p-2 rounded shadow-lg">
          <p className="text-xs" style={{ color: colors.textSecondary }}>{format(new Date(label), 'MMM d, yyyy')}</p>
          <p className="text-sm font-medium" style={{ color: colors.onSurface }}>${payload[0].value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
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
          <CartesianGrid strokeDasharray="3 3" stroke={colors.cardStroke} opacity={0.7} /> // Enhanced gridlines for clarity
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => format(new Date(value), 'MMM')}
            tick={{ fontSize: 10, fill: colors.textSecondary }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `$${value}`}
            tick={{ fontSize: 10, fill: colors.textSecondary }}
          />
          <Tooltip content={renderTooltip} />
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.success} stopOpacity={0.2} />
              <stop offset="95%" stopColor={colors.success} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={colors.success}
            strokeWidth={2}
            fill="url(#equityGradient)"
            fillOpacity={1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
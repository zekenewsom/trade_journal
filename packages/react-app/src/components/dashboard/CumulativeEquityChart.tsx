import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { MetricCard } from '../ui/MetricCard';
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
    <MetricCard title="Cumulative Equity Curve" size="lg" className="col-span-6 row-span-2">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.cardStroke} />
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
              tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
              tick={{ fontSize: 10, fill: colors.textSecondary }}
            />
            <Tooltip content={renderTooltip} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={colors.primary} 
              strokeWidth={2} 
              activeDot={{ r: 6, fill: colors.primary, stroke: colors.surface, strokeWidth: 2 }}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </MetricCard>
  );
} 
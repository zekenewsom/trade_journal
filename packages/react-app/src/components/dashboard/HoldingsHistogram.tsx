import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { MetricCard } from '../ui/MetricCard';
import { colors } from '../../styles/design-tokens';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

interface HoldingsHistogramProps {
  data: Array<{
    r: string;
    value: number;
  }>;
}

export function HoldingsHistogram({ data }: HoldingsHistogramProps) {
  const renderTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const isPositive = Number(label) >= 0;
      
      return (
        <div style={{ background: colors.surface, border: `1px solid ${colors.cardStroke}` }} className="p-2 rounded shadow-lg">
          <p className="text-xs" style={{ color: colors.textSecondary }}>{`R-Multiple: ${label}R`}</p>
          <p className="text-sm font-medium" style={{ color: isPositive ? colors.success : colors.error }}>
            {payload[0].value} trades
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <MetricCard title="R-Multiple Histogram (Last 100 Trades)" size="sm" className="col-span-3 row-span-2">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            barGap={0}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.cardStroke} vertical={false} />
            <XAxis
              dataKey="r"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickCount={data.length}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
            />
            <Tooltip content={renderTooltip} />
            <Bar
              dataKey="value"
              barSize={12}
              radius={[2, 2, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={Number(entry.r) >= 0 ? colors.success : colors.error} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </MetricCard>
  );
} 
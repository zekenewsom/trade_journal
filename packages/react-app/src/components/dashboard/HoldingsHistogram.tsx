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
        <div className="bg-dark-600 p-2 border border-dark-400 rounded shadow-lg">
          <p className="text-xs text-gray-400">{`R-Multiple: ${label}R`}</p>
          <p className={`text-sm font-medium ${isPositive ? 'text-positive' : 'text-negative'}`}>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1B1D" vertical={false} />
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
                <Cell key={`cell-${index}`} fill={Number(entry.r) >= 0 ? '#00E28A' : '#FF4D67'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </MetricCard>
  );
} 
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
import { MetricCard } from '../ui/MetricCard';
import { format } from 'date-fns';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

interface DrawdownChartProps {
  data: Array<{
    date: string;
    value: number;
  }>;
}

export function DrawdownChart({ data }: DrawdownChartProps) {
  const renderTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-600 p-2 border border-dark-400 rounded shadow-lg">
          <p className="text-xs text-gray-400">{format(new Date(label), 'MMM d, yyyy')}</p>
          <p className="text-sm font-medium text-negative">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <MetricCard title="Drawdown Curve" size="sm" className="col-span-3 row-span-2">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1B1D" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => format(new Date(value), 'MMM')}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              domain={['dataMin', 0]}
            />
            <Tooltip content={renderTooltip} />
            <defs>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF4D67" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#FF4D67" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#FF4D67"
              strokeWidth={2}
              fill="url(#drawdownGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </MetricCard>
  );
} 
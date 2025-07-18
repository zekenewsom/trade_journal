import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import type { TooltipProps } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

interface CumulativeEquityChartProps {
  data: Array<{
    date: string;
    value: number;
  }>;
}

export function CumulativeEquityChart({ data }: CumulativeEquityChartProps) {
  const theme = useTheme();
  
  const renderTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 rounded shadow-lg bg-white border border-gray-200">
          <p className="text-xs text-secondary">{format(new Date(label), 'MMM d, yyyy')}</p>
          <p className="text-sm font-medium text-primary">
            ${Number(payload[0].value)?.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
      <AreaChart
        data={data}
        margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis
          dataKey="date"
          axisLine={{ stroke: theme.palette.divider }}
          tickLine={{ stroke: theme.palette.divider }}
          tickFormatter={(value) => format(new Date(value), 'MMM dd')}
          interval={Math.max(Math.floor(data.length / 5), 1)}
          tick={{ fontSize: 12, fill: theme.palette.text.primary }}
          angle={-45}
          textAnchor="end"
          height={70}
        />
        <YAxis
          axisLine={{ stroke: theme.palette.divider }}
          tickLine={{ stroke: theme.palette.divider }}
          tickFormatter={(value) => `$${Math.round(value)}`}
          tick={{ fontSize: 12, fill: theme.palette.text.primary }}
          width={50}
        />
        <Tooltip content={renderTooltip} />
        <defs>
          <linearGradient id="cumulativeEquityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3} />
            <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={theme.palette.success.main}
          strokeWidth={2}
          fill="url(#cumulativeEquityGradient)"
          fillOpacity={1}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
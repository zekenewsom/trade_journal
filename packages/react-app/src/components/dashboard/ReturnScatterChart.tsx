import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { MetricCard } from '../ui/MetricCard';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { colors } from '../../styles/design-tokens';

interface ReturnScatterChartProps {
  data: Array<{
    x: number; // risk
    y: number; // return
    z: number; // size (trade volume)
    ticker: string;
  }>;
}

export function ReturnScatterChart({ data }: ReturnScatterChartProps) {
  const renderTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      
      return (
        <div className="p-2 border rounded shadow-lg" style={{ background: colors.surfaceVariant, borderColor: colors.border }}>
          <p className="text-xs font-medium">{item.ticker}</p>
          <p className="text-xs" style={{ color: colors.textSecondary }}>Risk: {item.x.toFixed(2)}</p>
          <p className="text-xs" style={{ color: item.y >= 0 ? colors.success : colors.error }}>
            Return: {item.y >= 0 ? '+' : ''}{item.y.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Prepare data with fill colors
  const dataWithColors = data.map(item => ({
    ...item,
    fill: item.y >= 0 ? colors.success : colors.error
  }));

  return (
    <MetricCard title="Return vs Risk Scatter" size="lg" className="col-span-6 row-span-2">
      <div className="h-64 relative">
        <div className="absolute inset-0 flex items-center justify-between px-8 text-xs pointer-events-none" style={{ color: colors.textSecondary }}>
          <div className="text-center">
            <div>Lower risk</div>
            <div>Lower return</div>
          </div>
          <div className="text-center">
            <div>Higher risk</div>
            <div>Higher return</div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis
              type="number"
              dataKey="x"
              name="Risk"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: colors.textSecondary }}
              domain={['dataMin', 'dataMax']}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Return"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: colors.textSecondary }}
              domain={['dataMin', 'dataMax']}
            />
            <ZAxis
              type="number"
              dataKey="z"
              range={[50, 500]}
              name="Volume"
            />
            <Tooltip content={renderTooltip} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter
              name="Trades"
              data={dataWithColors}
              fill={colors.success}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </MetricCard>
  );
} 
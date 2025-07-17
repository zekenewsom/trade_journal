import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { format } from 'date-fns';

interface CumulativeEquityChartProps {
  data: Array<{
    date: string;
    value: number;
  }>;
}

const chartConfig = {
  value: {
    label: "Cumulative Equity",
    color: "hsl(142 76% 36%)", // Green color for equity
  },
}

export function CumulativeEquityChart({ data }: CumulativeEquityChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cumulative Equity</CardTitle>
        <CardDescription>Portfolio value over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            height={400}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => format(new Date(value), 'MMM dd')}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value: any) => [
                    `$${value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
                    "Cumulative Equity"
                  ]}
                  labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                />
              }
            />
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              fill="url(#equityGradient)"
              fillOpacity={1}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
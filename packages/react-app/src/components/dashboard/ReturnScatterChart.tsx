import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ReturnScatterChartProps {
  data: Array<{
    x: number; // risk
    y: number; // return
    z: number; // size (trade volume)
    ticker: string;
  }>;
}

const chartConfig = {
  x: {
    label: "Risk",
    color: "hsl(var(--chart-1))",
  },
  y: {
    label: "Return",
    color: "hsl(var(--chart-2))",
  },
}

export function ReturnScatterChart({ data }: ReturnScatterChartProps) {
  return (
    <Card className="col-span-6 row-span-2">
      <CardHeader>
        <CardTitle>Return vs Risk Scatter</CardTitle>
        <CardDescription>Risk-return profile of trades with volume sizing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 relative">
          <div className="absolute inset-0 flex items-center justify-between px-8 text-xs pointer-events-none text-muted-foreground">
            <div className="text-center">
              <div>Lower risk</div>
              <div>Lower return</div>
            </div>
            <div className="text-center">
              <div>Higher risk</div>
              <div>Higher return</div>
            </div>
          </div>
          
          <ChartContainer config={chartConfig}>
            <ScatterChart
              data={data}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              height={256}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                name="Risk"
                axisLine={false}
                tickLine={false}
                domain={['dataMin', 'dataMax']}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Return"
                axisLine={false}
                tickLine={false}
                domain={['dataMin', 'dataMax']}
              />
              <ZAxis
                type="number"
                dataKey="z"
                range={[50, 500]}
                name="Volume"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value: any, name: any, item: any) => [
                      name === 'x' ? `Risk: ${value.toFixed(2)}` :
                      name === 'y' ? `Return: ${value >= 0 ? '+' : ''}${value.toFixed(2)}%` :
                      value,
                      item.payload?.ticker || 'Trade'
                    ]}
                  />
                }
              />
              <Scatter
                name="Trades"
                data={data}
                fill="var(--color-x)"
              />
            </ScatterChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
} 
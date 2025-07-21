import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
const chartConfig = {
    value: {
        label: "Trades",
        color: "hsl(var(--chart-1))",
    },
};
export function HoldingsHistogram({ data }) {
    if (!Array.isArray(data) || data.length === 0) {
        return <div className="p-4 text-center text-secondary">No histogram data available.</div>;
    }
    return (
        <Card className="col-span-3 row-span-2">
            <CardHeader>
                <CardTitle>R-Multiple Histogram</CardTitle>
                <CardDescription>Distribution of trade returns (Last 100 Trades)</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }} barGap={0} height={256}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="r" axisLine={false} tickLine={false} tickCount={data.length} />
                        <YAxis axisLine={false} tickLine={false} />
                        <ChartTooltip content={<ChartTooltipContent formatter={(value, name, item) => [
                            `${value} trades`,
                            `R-Multiple: ${item.payload?.r}R`
                        ]} />} />
                        <Bar dataKey="value" barSize={12} radius={[2, 2, 0, 0]}>
                            {data.map((entry, index) => {
                                if (entry && entry.r !== undefined && entry.r !== null) {
                                    return (
                                        <Cell
                                            fill={Number(entry.r) >= 0 ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"}
                                            key={`cell-${index}`}
                                        />
                                    );
                                }
                                return null;
                            })}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

HoldingsHistogram.propTypes = {
    data: PropTypes.array.isRequired
};

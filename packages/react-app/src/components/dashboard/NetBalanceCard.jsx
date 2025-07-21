import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
export function NetBalanceCard({ value = 1247862.34, change = 39825.12, changePercentage = 3.09, history = [] }) {
    // Using mock data if not provided
    const mockHistory = history.length > 0 ? history : [
        { t: '2023-01', v: 1100000 },
        { t: '2023-02', v: 1150000 },
        { t: '2023-03', v: 1100000 },
        { t: '2023-04', v: 1200000 },
        { t: '2023-05', v: 1180000 },
        { t: '2023-06', v: 1250000 },
        { t: '2023-07', v: 1247862 }
    ];
    const isPositive = change >= 0;
    const changeColor = isPositive ? 'text-green-600' : 'text-error';
    const changePrefix = isPositive ? '+' : '';
    const theme = useTheme();

    const balanceDisplay = (
        <div className="text-3xl font-semibold font-mono text-primary">
            ${<CountUp end={value} separator="," decimals={2} preserveValue />}
        </div>
    );

    const changeIndicator = (
        <div className={`flex items-center gap-2 text-sm ${changeColor}`}>
            <span>
                {changePrefix}${Math.abs(change).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span>
                ({changePrefix}{Math.abs(changePercentage).toFixed(2)}%)
            </span>
        </div>
    );

    const chartContainer = (
        <div className="h-14 mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockHistory}>
                    <Line
                        type="monotone"
                        dataKey="v"
                        stroke={theme.palette.text.primary}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={true}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );

    return (
        <MetricCard
            title="Net Account Balance"
            size="lg"
            status={isPositive ? 'good' : 'bad'}
            className="bg-white"
        >
            <div className="flex flex-col gap-1">
                {balanceDisplay}
                {changeIndicator}
            </div>
            {chartContainer}
        </MetricCard>
    );
}

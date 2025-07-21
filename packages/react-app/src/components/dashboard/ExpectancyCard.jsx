import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
export function ExpectancyCard({ value = 0 }) {
    const getStatus = () => {
        if (value >= 2000)
            return 'good';
        if (value >= 500)
            return 'moderate';
        if (value <= 0)
            return 'bad';
        return 'default';
    };
    const isPositive = Number(value) >= 0;
    // Use only text-primary for main value, let MetricCard status handle color, and use a single color class for the label
    const valueColorClass = 'text-2xl font-semibold font-mono text-primary';
    const labelColorClass = 'text-xs font-medium';
    return (
        <MetricCard title="Expectancy (R*Trade)" size="sm" status={getStatus()}>
            <div className="flex flex-col">
                <div className={valueColorClass}>
                    {isPositive ? '+' : ''}
                    <CountUp end={Number(value)} separator="," decimal="." decimals={2} duration={1} prefix="$" />
                </div>
                <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-secondary">Per trade profit/loss</span>
                    <span className={labelColorClass}>
                        {Number(value) >= 500 ? 'Strong' : isPositive ? 'Profitable' : 'Unprofitable'}
                    </span>
                </div>
            </div>
        </MetricCard>
    );
}

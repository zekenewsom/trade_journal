import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
export function MaxDrawdownCard({ value = -12.47, amountLost = 156483.48 }) {
    // Drawdown is always shown as negative, so we need to ensure the value is negative
    const drawdownValue = value <= 0 ? value : -value;
    // The divisor represents the maximum expected drawdown percentage for the progress bar
    const MAX_DRAWDOWN_PERCENT = 25; // Adjust as needed for your use case
    // amountLost is assumed to be positive
    const progress = Math.min((Math.abs(drawdownValue) / MAX_DRAWDOWN_PERCENT) * 100, 100);

    return (
        <MetricCard title="Max Historical Drawdown" status="bad">
            <div className="flex flex-col bg-surface">
                <div className="text-2xl font-semibold font-mono text-primary">
                    <CountUp end={drawdownValue} decimals={2} preserveValue={true} suffix="%" />
                </div>
                <div className="text-xs text-secondary mt-1">
                    <span className="text-primary">
                        ${amountLost.toLocaleString()}
                    </span>{' '}lost
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden mt-2 bg-gray-200">
                    <div
                        className="h-full bg-red-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </MetricCard>
    );
}

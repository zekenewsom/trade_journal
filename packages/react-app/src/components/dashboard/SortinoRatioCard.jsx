import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import PropTypes from 'prop-types';

const DEFAULT_SORTINO_VALUE = 3.14;
const DEFAULT_SORTINO_STATUS = 'good';
const MAX_RATIO_VALUE = 5;

export function SortinoRatioCard({ value = DEFAULT_SORTINO_VALUE, status = DEFAULT_SORTINO_STATUS }) {
    // Calculate the ratio for the progress bar (assuming good > 2, moderate 1-2, bad < 1)
    const ratio = Math.min(value / MAX_RATIO_VALUE, 1) * 100;
    let barColor = '';
    if (status === 'excellent' || status === 'good') barColor = 'bg-success';
    else if (status === 'moderate') barColor = 'bg-warning';
    else barColor = 'bg-error';

    return (
        <MetricCard title="Sortino Ratio" status={status} className="bg-white">
            <div className="flex flex-col">
                <div className="text-2xl font-semibold font-mono text-primary">
                    <CountUp end={value} decimals={2} preserveValue />
                </div>
                <div className="flex items-center justify-between mt-1 mb-1">
                    <div className="text-xs text-secondary">Poor</div>
                    <div className="text-xs text-secondary">Excellent</div>
                </div>
                <div className="w-full h-1 rounded-full bg-gray-200">
                    <div className={barColor + " h-full rounded-full"} style={{ width: `${ratio}%` }} />
                </div>
            </div>
        </MetricCard>
    );
}

SortinoRatioCard.propTypes = {
    value: PropTypes.number,
    status: PropTypes.oneOf(['excellent', 'good', 'moderate', 'bad'])
};

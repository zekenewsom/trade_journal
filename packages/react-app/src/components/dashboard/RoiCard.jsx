import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const GOOD_THRESHOLD = 15;
const MODERATE_THRESHOLD = 5;
const BAD_THRESHOLD = 0;
const PROGRESS_MIN = 0;
const PROGRESS_MAX = 15;

export function RoiCard({ value }) {
    // Determine status based on ROI value
    const getStatus = () => {
        if (value >= GOOD_THRESHOLD)
            return 'good';
        if (value >= MODERATE_THRESHOLD)
            return 'moderate';
        if (value < BAD_THRESHOLD)
            return 'bad';
        return 'default';
    };
    // Calculate progress percentage (clamped between min and max)
    const progressPercent = Math.max(PROGRESS_MIN, Math.min(value, PROGRESS_MAX)) / PROGRESS_MAX * 100;
    return (
        <MetricCard title="ROI %" size="sm" status={getStatus()} className="bg-white">
            <div className="flex flex-col">
                <div className={clsx('text-2xl font-semibold font-mono text-primary')}>
                    {value >= 0 ? '+' : ''}
                    <CountUp end={value} decimals={1} duration={1} suffix="%" />
                </div>
                <div
                    className="relative h-2 mt-2 w-full bg-gray-200 rounded"
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={PROGRESS_MIN}
                    aria-valuemax={PROGRESS_MAX}
                    aria-label="ROI progress"
                >
                    <div
                        className={clsx('h-2 rounded',
                            getStatus() === 'good' ? 'bg-success' :
                            getStatus() === 'moderate' ? 'bg-warning' :
                            getStatus() === 'bad' ? 'bg-error' : 'bg-primary')}
                        style={{ width: `${progressPercent}%`, transition: 'width 0.5s' }}
                    />
                </div>
            </div>
        </MetricCard>
    );
}

RoiCard.propTypes = {
    value: PropTypes.number.isRequired
};

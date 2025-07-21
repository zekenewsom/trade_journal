import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MetricCard } from '../ui/MetricCard';
import CountUp from 'react-countup';
import { useAppStore } from '../../stores/appStore';
import PropTypes from 'prop-types';
/**
 * BuyingPowerCard displays the user's available buying power and allocation.
 *
 * The default allocation value is set to 64, which may represent a typical or recommended allocation percentage
 * based on historical usage patterns or business logic. Adjust this value as needed to match your application's
 * requirements or to reflect a more meaningful default for your users.
 */
export function BuyingPowerCard({ allocation = 64 }) {
    // Get aggregated available buying power from the store with error handling
    let totalBuyingPower = 0;
    try {
        totalBuyingPower = useAppStore(s => s.getTotalBuyingPower());
    } catch (error) {
        console.error('Error getting total buying power:', error);
        totalBuyingPower = 0;
    }

    const allocationInfo = (
        <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-secondary">
                <span className="mr-1">Allocation:</span>
                <span className="font-medium">{allocation}%</span>
            </div>
            <div className="text-xs text-secondary">
                <span className="mr-1">Free:</span>
                <span className="font-medium">{100 - allocation}%</span>
            </div>
        </div>
    );

    const progressBar = (
        <div className="mt-1">
            <div className="w-full h-1.5 rounded-full overflow-hidden bg-gray-200">
                <div className="h-full bg-primary" style={{ width: `${allocation}%` }} />
            </div>
        </div>
    );

    return (
        <MetricCard title="Available Buying Power" className="bg-white">
            <div className="flex flex-col">
                <div className="text-2xl font-semibold font-mono text-primary">
                    $<CountUp end={totalBuyingPower} separator="," decimals={2} preserveValue />
                </div>
                {allocationInfo}
                {progressBar}
            </div>
        </MetricCard>
    );
}

BuyingPowerCard.propTypes = {
    allocation: PropTypes.number
};

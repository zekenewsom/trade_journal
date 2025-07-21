import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Paper, Typography, Box } from '@mui/material';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';

const KeyMetricCard = ({ title, value, change, trendData }) => {
    const isValidTrendData = Array.isArray(trendData) && trendData.length > 0;
    return (
        <Paper className="p-4 rounded-2xl h-full bg-white">
            <Typography variant="subtitle1" className="mb-1 text-secondary">
                {title}
            </Typography>
            <Typography variant="h4" className="mb-0.5 font-bold text-primary">
                {value}
            </Typography>
            {change && (
                <Typography variant="body2" className="text-secondary">
                    {change}
                </Typography>
            )}
            <Box
                className="w-full mt-2"
                role="img"
                aria-label={`Trend chart for ${title}`}
                sx={{ height: '50px' }}
            >
                {isValidTrendData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="var(--color-on-surface-variant)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <Typography variant="caption" className="text-secondary" sx={{ fontSize: '0.75rem', textAlign: 'center', opacity: 0.7 }}>
                        No trend data available
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

KeyMetricCard.propTypes = {
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    change: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    trendData: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.number,
        // Optionally add more shape validation if trendData objects have more fields
    }))
};

export default KeyMetricCard;

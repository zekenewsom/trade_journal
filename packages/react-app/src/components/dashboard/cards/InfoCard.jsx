import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Paper, Typography, Box, LinearProgress } from '@mui/material';
import PropTypes from 'prop-types';
const InfoCard = ({ title, value, description, progress, progressColor, icon }) => {
    return (
        <Paper className="p-4 rounded-2xl h-full flex flex-col justify-between bg-white">
            <Box>
                <Typography variant="subtitle2" className="mb-0.5 flex items-center text-secondary">
                    {icon && (
                        <Box component="span" className="mr-1">
                            {icon}
                        </Box>
                    )}
                    {title}
                </Typography>
                <Typography variant="h5" component="div" className="mb-1 font-bold text-primary">
                    {value}
                </Typography>
                {description && (
                    <Typography variant="caption" className="text-secondary">
                        {description}
                    </Typography>
                )}
            </Box>
            {progress !== undefined && (
                <Box className="w-full mt-1">
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        color={progressColor || 'primary'}
                        className="bg-gray-200"
                    />
                </Box>
            )}
        </Paper>
    );
};
InfoCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    description: PropTypes.string,
    progress: (props, propName, componentName) => {
        const value = props[propName];
        if (value === undefined) return null;
        if (typeof value !== 'number' || value < 0 || value > 100) {
            return new Error(
                `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Must be a number between 0 and 100.`
            );
        }
        return null;
    },
    progressColor: PropTypes.string,
    icon: PropTypes.element
};
export default InfoCard;

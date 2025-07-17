import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Paper, Typography, Box, LinearProgress } from '@mui/material';
const InfoCard = ({ title, value, description, progress, progressColor, icon }) => {
    return (_jsxs(Paper, { className: "p-4 rounded-2xl h-full flex flex-col justify-between bg-white", children: [_jsxs(Box, { children: [_jsxs(Typography, { variant: "subtitle2", className: "mb-0.5 flex items-center text-secondary", children: [icon && _jsx(Box, { component: "span", className: "mr-1", children: icon }), title] }), _jsx(Typography, { variant: "h5", component: "div", className: "mb-1 font-bold text-primary", children: value }), description && _jsx(Typography, { variant: "caption", className: "text-secondary", children: description })] }), progress !== undefined && (_jsx(Box, { className: "w-full mt-1", children: _jsx(LinearProgress, { variant: "determinate", value: progress, color: progressColor || 'primary', className: "bg-gray-200" }) }))] }));
};
export default InfoCard;

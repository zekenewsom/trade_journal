import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Paper, Typography, Box, LinearProgress } from '@mui/material';
const InfoCard = ({ title, value, description, progress, progressColor, valueColor, icon }) => {
    return (_jsxs(Paper, { sx: { p: 2, backgroundColor: '#1e2230', color: '#e0e0e0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }, children: [_jsxs(Box, { children: [_jsxs(Typography, { variant: "subtitle2", sx: { color: '#8be9fd', mb: 0.5, display: 'flex', alignItems: 'center' }, children: [icon && _jsx(Box, { component: "span", sx: { mr: 1 }, children: icon }), title] }), _jsx(Typography, { variant: "h5", component: "div", sx: { fontWeight: 'bold', color: valueColor || '#f8f8f2', mb: 1 }, children: value }), description && _jsx(Typography, { variant: "caption", sx: { color: '#6272a4' }, children: description })] }), progress !== undefined && (_jsx(Box, { sx: { width: '100%', mt: 1 }, children: _jsx(LinearProgress, { variant: "determinate", value: progress, color: progressColor || 'primary' }) }))] }));
};
export default InfoCard;

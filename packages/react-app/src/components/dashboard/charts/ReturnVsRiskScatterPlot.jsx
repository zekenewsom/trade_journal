import { jsx as _jsx } from "react/jsx-runtime";
import { Paper, Typography } from '@mui/material';
import { colors } from '/src/styles/design-tokens';
const ReturnVsRiskScatterPlot = () => (_jsx(Paper, { sx: { p: 2, backgroundColor: colors.surface, color: colors.onSurface, height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsx(Typography, { variant: "subtitle2", sx: { color: colors.textSecondary, textAlign: 'center', mb: 1 }, children: "Return vs Risk Scatter (Coming Soon)" }) }));
export default ReturnVsRiskScatterPlot;

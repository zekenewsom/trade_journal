import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Grid } from '@mui/material';
export default function TestMuiGrid() {
    return (_jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { size: { xs: 12, md: 6 }, sx: (theme) => ({ backgroundColor: theme.palette.background.paper, p: 2 }), children: "Item 1" }), _jsx(Grid, { size: { xs: 12, md: 6 }, sx: (theme) => ({ backgroundColor: theme.palette.background.paper, p: 2 }), children: "Right" })] }));
}

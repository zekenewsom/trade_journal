import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Grid } from '@mui/material';
export default function TestMuiGrid() {
    return (_jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { size: { xs: 12, md: 6 }, sx: { background: '#23263a', p: 2 }, children: "Left" }), _jsx(Grid, { size: { xs: 12, md: 6 }, sx: { background: '#ccc', p: 2 }, children: "Right" })] }));
}

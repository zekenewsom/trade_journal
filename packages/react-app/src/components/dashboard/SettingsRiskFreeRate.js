import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/CheckCircleOutline';
import Typography from '@mui/material/Typography';
const SettingsRiskFreeRate = () => {
    const riskFreeRate = useAppStore(s => s.riskFreeRate);
    const setRiskFreeRate = useAppStore(s => s.setRiskFreeRate);
    const [inputValue, setInputValue] = useState(riskFreeRate);
    const [confirmed, setConfirmed] = useState(false);
    const handleConfirm = () => {
        setRiskFreeRate(inputValue);
        setConfirmed(true);
        setTimeout(() => setConfirmed(false), 1500);
    };
    return (_jsxs(Box, { sx: { my: 2 }, children: [_jsx(TextField, { label: "Risk-Free Rate (%)", type: "number", value: inputValue, onChange: e => setInputValue(Number(e.target.value)), inputProps: { step: 0.01, min: 0 }, helperText: "Set the annual risk-free rate (e.g., US Treasury yield) for Sharpe Ratio calculation.", sx: { mr: 2, width: 180 } }), _jsx(Button, { variant: "contained", color: "primary", onClick: handleConfirm, sx: { height: 56, mt: { xs: 2, sm: 0 } }, disabled: inputValue === riskFreeRate, children: "Confirm" }), confirmed && (_jsx(CheckIcon, { sx: { color: 'success.main', ml: 2, verticalAlign: 'middle' } })), _jsxs(Typography, { variant: "body2", sx: { mt: 2, color: 'text.secondary' }, children: ["Current risk-free rate: ", _jsxs("b", { children: [riskFreeRate, "%"] })] })] }));
};
export default SettingsRiskFreeRate;

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/CheckCircleOutline';
import Typography from '@mui/material/Typography';

const MIN_RATE = 0;
const MAX_RATE = 20;

const SettingsRiskFreeRate = () => {
    const riskFreeRate = useAppStore(s => s.riskFreeRate);
    const setRiskFreeRate = useAppStore(s => s.setRiskFreeRate);
    const [inputValue, setInputValue] = useState(riskFreeRate);
    const [confirmed, setConfirmed] = useState(false);
    const [error, setError] = useState('');
    const timeoutRef = useRef(null);

    const validate = (value) => {
        if (value === '' || value === null || value === undefined) {
            return 'Risk-free rate is required.';
        }
        if (isNaN(value)) {
            return 'Risk-free rate must be a number.';
        }
        if (value < MIN_RATE || value > MAX_RATE) {
            return `Risk-free rate must be between ${MIN_RATE} and ${MAX_RATE}.`;
        }
        return '';
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        const numVal = val === '' ? '' : Number(val);
        setInputValue(numVal);
        setError(validate(numVal));
    };

    const handleConfirm = () => {
        setRiskFreeRate(inputValue);
        setConfirmed(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setConfirmed(false), 1500);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        setError(validate(inputValue));
    }, [inputValue]);

    const isInputInvalid = !!error;
    const isButtonDisabled = isInputInvalid || inputValue === riskFreeRate;

    return (
        <Box sx={{ my: 2 }}>
            <TextField
                label="Risk-Free Rate (%)"
                type="number"
                value={inputValue}
                onChange={handleInputChange}
                inputProps={{ step: 0.01, min: MIN_RATE, max: MAX_RATE }}
                error={isInputInvalid}
                helperText={
                    isInputInvalid
                        ? error
                        : "Set the annual risk-free rate (e.g., US Treasury yield) for Sharpe Ratio calculation."
                }
                sx={{ mr: 2, width: 180 }}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleConfirm}
                sx={{ height: 56, mt: { xs: 2, sm: 0 } }}
                disabled={isButtonDisabled}
            >
                Confirm
            </Button>
            {confirmed && (
                <CheckIcon sx={{ color: 'success.main', ml: 2, verticalAlign: 'middle' }} />
            )}
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Current risk-free rate: <b>{riskFreeRate}%</b>
            </Typography>
        </Box>
    );
};
export default SettingsRiskFreeRate;

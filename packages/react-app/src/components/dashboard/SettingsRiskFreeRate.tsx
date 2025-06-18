import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/CheckCircleOutline';
import Typography from '@mui/material/Typography';

const SettingsRiskFreeRate: React.FC = () => {
  const riskFreeRate = useAppStore(s => s.riskFreeRate);
  const setRiskFreeRate = useAppStore(s => s.setRiskFreeRate);
  const [inputValue, setInputValue] = useState(riskFreeRate);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setRiskFreeRate(inputValue);
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 1500);
  };

  return (
    <Box sx={{ my: 2 }}>
      <TextField
        label="Risk-Free Rate (%)"
        type="number"
        value={inputValue}
        onChange={e => setInputValue(Number(e.target.value))}
        inputProps={{ step: 0.01, min: 0 }}
        helperText="Set the annual risk-free rate (e.g., US Treasury yield) for Sharpe Ratio calculation."
        sx={{ mr: 2, width: 180 }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleConfirm}
        sx={{ height: 56, mt: { xs: 2, sm: 0 } }}
        disabled={inputValue === riskFreeRate}
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

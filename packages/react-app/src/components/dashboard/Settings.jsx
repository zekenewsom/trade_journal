import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SettingsRiskFreeRate from './SettingsRiskFreeRate';

const Settings = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Risk-Free Rate
            </Typography>
            <SettingsRiskFreeRate />
        </Box>
    );
};

export default Settings;

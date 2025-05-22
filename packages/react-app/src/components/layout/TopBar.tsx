// packages/react-app/src/components/layout/TopBar.tsx
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  useTheme,
  useMediaQuery,
  Divider,
  SelectChangeEvent,
  Menu, // For mobile actions
} from '@mui/material';
import {
  Menu as MenuIcon, // Hamburger
  Search as SearchIcon,
  
  PlusCircle as AddTradeIcon,


  MoreVertical as MoreVertIcon, // For mobile actions
} from 'lucide-react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { useAppStore } from '../../stores/appStore'; // For strategy list, and eventually filter state
import { colors, typography, borderRadius, spacing } from '../../styles/design-tokens'; // For direct color usage if needed
import { alpha } from '@mui/material/styles';

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Local state for filters - ideally, this would live in Zustand store if global
  const [startDate, setStartDate] = useState<Date | null>(new Date(2023, 0, 1)); // Example Start Date
  const [endDate, setEndDate] = useState<Date | null>(new Date(2023, 4, 12));     // Example End Date
  const [selectedStrategy, setSelectedStrategy] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const analytics = useAppStore(state => state.analytics);
  const navigateTo = useAppStore(state => state.navigateTo);

  const handleStrategyChange = (event: SelectChangeEvent<string>) => {
    setSelectedStrategy(event.target.value as string);
    // TODO: Trigger data refetch via appStore action
  };

  const handleDateChange = (type: 'start' | 'end') => (date: Date | null) => {
    if (type === 'start') setStartDate(date);
    else setEndDate(date);
    // TODO: Trigger data refetch via appStore action
  };

  // Mobile actions menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const mobileMenuOpen = Boolean(anchorEl);
  const handleMobileMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMobileMenuClose = () => {
    setAnchorEl(null);
  };

  const actionButtons = (
    <>
      <Button
        variant="contained"
        startIcon={<AddTradeIcon size={18} />}
        onClick={() => navigateTo('logTransactionForm', { navTimestamp: Date.now() })}
        sx={{
          backgroundColor: colors.primary, // Using design token
          color: colors.onPrimary,
          '&:hover': { backgroundColor: alpha(colors.primary, 0.85) },
          textTransform: 'none',
          fontSize: typography.fontSize.sm,
          padding: '6px 12px',
          borderRadius: borderRadius.md,
        }}
      >
        Add Trade
      </Button>


    </>
  );

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: colors.topBarBackground, // design token
        borderBottom: `1px solid ${colors.border}`, // design token
      }}
    >
      <Toolbar sx={{ minHeight: spacing.topBarHeight, height: spacing.topBarHeight, paddingX: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          {onMenuClick && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onMenuClick}
              sx={{ mr: 1, color: colors.textSecondary }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            {!isMobile && (
              <>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={handleDateChange('start')}
                  slotProps={{
                    textField: { size: 'small', sx: { mr: 1, width: 150 } },
                    openPickerButton: { sx: { color: colors.textSecondary } },
                  }}
                  sx={{
                    '& .MuiInputLabel-root': { fontSize: typography.fontSize.xs, color: colors.textSecondary },
                    '& .MuiInputBase-input': { fontSize: typography.fontSize.sm, color: colors.onSurface },
                    '& .MuiOutlinedInput-root fieldset': { borderColor: colors.border },
                  }}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={handleDateChange('end')}
                  slotProps={{
                    textField: { size: 'small', sx: { mr: 2, width: 150 } },
                    openPickerButton: { sx: { color: colors.textSecondary } },
                  }}
                  sx={{
                    '& .MuiInputLabel-root': { fontSize: typography.fontSize.xs, color: colors.textSecondary },
                    '& .MuiInputBase-input': { fontSize: typography.fontSize.sm, color: colors.onSurface },
                    '& .MuiOutlinedInput-root fieldset': { borderColor: colors.border },
                  }}
                />
                <Divider orientation="vertical" flexItem sx={{ borderColor: colors.border, mx: 1, my: 1.5, display: { xs: 'none', md: 'block' } }} />
                <FormControl size="small" sx={{ minWidth: 180, mr: 2 }}>
                  <InputLabel
                    id="strategy-select-label"
                    sx={{ fontSize: typography.fontSize.xs, color: colors.textSecondary }}
                  >
                    Strategy
                  </InputLabel>
                  <Select
                    labelId="strategy-select-label"
                    value={selectedStrategy}
                    onChange={handleStrategyChange}
                    label="Strategy"
                    sx={{
                        fontSize: typography.fontSize.sm,
                        color: colors.onSurface,
                        '.MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                        '.MuiSvgIcon-root': { color: colors.textSecondary },
                        borderRadius: borderRadius.md,
                    }}
                  >
                    <MenuItem value="all">All Strategies</MenuItem>
                    {analytics?.availableStrategies?.map((s) => (
                      <MenuItem key={s.strategy_id} value={String(s.strategy_id)}>
                        {s.strategy_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
          </LocalizationProvider>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0.5 : 1.5 }}>
          {!isMobile && (
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search Tickers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon style={{ color: colors.textSecondary }} />
                  </InputAdornment>
                ),
                sx: {
                  fontSize: typography.fontSize.sm,
                  color: colors.onSurface,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.surfaceVariant, // design token
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                   height: '36px', // Match button height
                },
              }}
              sx={{ width: 200 }}
            />
          )}

          {isMobile ? (
            <>
              <IconButton sx={{color: colors.textSecondary}}><SearchIcon /></IconButton>
              <IconButton
                aria-label="more actions"
                id="long-button"
                aria-controls={mobileMenuOpen ? 'long-menu' : undefined}
                aria-expanded={mobileMenuOpen ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleMobileMenuClick}
                sx={{color: colors.textSecondary}}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                id="long-menu"
                MenuListProps={{ 'aria-labelledby': 'long-button' }}
                anchorEl={anchorEl}
                open={mobileMenuOpen}
                onClose={handleMobileMenuClose}
                PaperProps={{
                  style: {
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                  },
                }}
              >
                <MenuItem onClick={handleMobileMenuClose} sx={{fontSize: typography.fontSize.sm, color: colors.onSurface}}>Add Trade</MenuItem>


              </Menu>
            </>
          ) : (
            actionButtons
          )}
          <IconButton sx={{ p: '6px', ml: isMobile ? 0 : 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: colors.primary, fontSize: typography.fontSize.sm }}>
              ZK {/* Or UserIcon */}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// packages/react-app/src/components/layout/TopBar.tsx
import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Button, Box, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel, Avatar, useTheme, useMediaQuery, Divider, Menu, // For mobile actions
 } from '@mui/material';
import { Menu as MenuIcon, // Hamburger
Search as SearchIcon, PlusCircle as AddTradeIcon, MoreVertical as MoreVertIcon, // For mobile actions
 } from 'lucide-react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAppStore } from '../../stores/appStore'; // For strategy list, and eventually filter state
import { colors, typography, borderRadius, spacing } from '../../styles/design-tokens'; // For direct color usage if needed
import { alpha } from '@mui/material/styles';
export function TopBar({ onMenuClick }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    // Local state for filters - ideally, this would live in Zustand store if global
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30); // default to last 30 days
        return d;
    });
    const [endDate, setEndDate] = useState(new Date());
    const [selectedStrategy, setSelectedStrategy] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const analytics = useAppStore(state => state.analytics);
    const fetchAnalyticsData = useAppStore(state => state.fetchAnalyticsData);
    const navigateTo = useAppStore(state => state.navigateTo);
    const handleStrategyChange = (event) => {
        const newStrategy = event.target.value;
        setSelectedStrategy(newStrategy);
        fetchAnalyticsData({
            dateRange: {
                startDate: startDate ? startDate.toISOString() : null,
                endDate: endDate ? endDate.toISOString() : null,
            },
            strategies: newStrategy !== 'all' ? [parseInt(newStrategy, 10)] : [],
        });
    };
    const handleDateChange = (type) => (date) => {
        const newStart = type === 'start' ? date : startDate;
        const newEnd = type === 'end' ? date : endDate;
        if (type === 'start')
            setStartDate(date);
        else
            setEndDate(date);
        fetchAnalyticsData({
            dateRange: {
                startDate: newStart ? newStart.toISOString() : null,
                endDate: newEnd ? newEnd.toISOString() : null,
            },
            strategies: selectedStrategy !== 'all' ? [parseInt(selectedStrategy, 10)] : [],
        });
    };
    // Mobile actions menu
    const [anchorEl, setAnchorEl] = React.useState(null);
    const mobileMenuOpen = Boolean(anchorEl);
    const handleMobileMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMobileMenuClose = () => {
        setAnchorEl(null);
    };
    const actionButtons = (_jsx(_Fragment, { children: _jsx(Button, { variant: "contained", startIcon: _jsx(AddTradeIcon, { size: 18 }), onClick: () => navigateTo('logTransactionForm', { navTimestamp: Date.now() }), sx: {
                backgroundColor: colors.primary, // Using design token
                color: colors.onPrimary,
                '&:hover': { backgroundColor: alpha(colors.primary, 0.85) },
                textTransform: 'none',
                fontSize: typography.fontSize.sm,
                padding: '6px 12px',
                borderRadius: borderRadius.md,
            }, children: "Add Trade" }) }));
    return (_jsx(AppBar, { position: "static", elevation: 0, sx: {
            backgroundColor: colors.topBarBackground, // design token
            borderBottom: `1px solid ${colors.border}`, // design token
        }, children: _jsxs(Toolbar, { sx: { minHeight: spacing.topBarHeight, height: spacing.topBarHeight, paddingX: { xs: 1, sm: 2 } }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', flexGrow: 1 }, children: [onMenuClick && (_jsx(IconButton, { color: "inherit", "aria-label": "open drawer", edge: "start", onClick: onMenuClick, sx: { mr: 1, color: colors.textSecondary }, children: _jsx(MenuIcon, {}) })), _jsx(LocalizationProvider, { dateAdapter: AdapterDateFns, children: !isMobile && (_jsxs(_Fragment, { children: [_jsx(DatePicker, { label: "Start Date", value: startDate, onChange: handleDateChange('start'), slotProps: {
                                            textField: { size: 'small', sx: { mr: 1, width: 150 } },
                                            openPickerButton: { sx: { color: colors.textSecondary } },
                                        }, sx: {
                                            '& .MuiInputLabel-root': { fontSize: typography.fontSize.xs, color: colors.textSecondary },
                                            '& .MuiInputBase-input': { fontSize: typography.fontSize.sm, color: colors.onSurface },
                                            '& .MuiOutlinedInput-root fieldset': { borderColor: colors.border },
                                        } }), _jsx(DatePicker, { label: "End Date", value: endDate, onChange: handleDateChange('end'), slotProps: {
                                            textField: { size: 'small', sx: { mr: 2, width: 150 } },
                                            openPickerButton: { sx: { color: colors.textSecondary } },
                                        }, sx: {
                                            '& .MuiInputLabel-root': { fontSize: typography.fontSize.xs, color: colors.textSecondary },
                                            '& .MuiInputBase-input': { fontSize: typography.fontSize.sm, color: colors.onSurface },
                                            '& .MuiOutlinedInput-root fieldset': { borderColor: colors.border },
                                        } }), _jsx(Divider, { orientation: "vertical", flexItem: true, sx: { borderColor: colors.border, mx: 1, my: 1.5, display: { xs: 'none', md: 'block' } } }), _jsxs(FormControl, { size: "small", sx: { minWidth: 180, mr: 2 }, children: [_jsx(InputLabel, { id: "strategy-select-label", sx: { fontSize: typography.fontSize.xs, color: colors.textSecondary }, children: "Strategy" }), _jsxs(Select, { labelId: "strategy-select-label", value: selectedStrategy, onChange: handleStrategyChange, label: "Strategy", sx: {
                                                    fontSize: typography.fontSize.sm,
                                                    color: colors.onSurface,
                                                    '.MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                                                    '.MuiSvgIcon-root': { color: colors.textSecondary },
                                                    borderRadius: borderRadius.md,
                                                }, children: [_jsx(MenuItem, { value: "all", children: "All Strategies" }), analytics?.availableStrategies?.map((s) => (_jsx(MenuItem, { value: String(s.strategy_id), children: s.strategy_name }, s.strategy_id)))] })] })] })) })] }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: isMobile ? 0.5 : 1.5 }, children: [!isMobile && (_jsx(TextField, { variant: "outlined", size: "small", placeholder: "Search Tickers...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), InputProps: {
                                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(SearchIcon, { style: { color: colors.textSecondary } }) })),
                                sx: {
                                    fontSize: typography.fontSize.sm,
                                    color: colors.onSurface,
                                    borderRadius: borderRadius.md,
                                    backgroundColor: colors.surfaceVariant, // design token
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                                    height: '36px', // Match button height
                                },
                            }, sx: { width: 200 } })), isMobile ? (_jsxs(_Fragment, { children: [_jsx(IconButton, { sx: { color: colors.textSecondary }, children: _jsx(SearchIcon, {}) }), _jsx(IconButton, { "aria-label": "more actions", id: "long-button", "aria-controls": mobileMenuOpen ? 'long-menu' : undefined, "aria-expanded": mobileMenuOpen ? 'true' : undefined, "aria-haspopup": "true", onClick: handleMobileMenuClick, sx: { color: colors.textSecondary }, children: _jsx(MoreVertIcon, {}) }), _jsx(Menu, { id: "long-menu", MenuListProps: { 'aria-labelledby': 'long-button' }, anchorEl: anchorEl, open: mobileMenuOpen, onClose: handleMobileMenuClose, PaperProps: {
                                        style: {
                                            backgroundColor: colors.surface,
                                            border: `1px solid ${colors.border}`,
                                        },
                                    }, children: _jsx(MenuItem, { onClick: handleMobileMenuClose, sx: { fontSize: typography.fontSize.sm, color: colors.onSurface }, children: "Add Trade" }) })] })) : (actionButtons), _jsx(IconButton, { sx: { p: '6px', ml: isMobile ? 0 : 1 }, children: _jsx(Avatar, { sx: { width: 32, height: 32, bgcolor: colors.primary, fontSize: typography.fontSize.sm }, children: "ZN " }) })] })] }) }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/react-app/src/components/layout/Sidebar.tsx
import { LayoutDashboard, BarChart3 as AnalyticsIcon, ListCollapse as TradesIcon, Wallet as AccountsIcon, Settings, Home, } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAppStore } from '../../stores/appStore';
import { colors, typography, spacing } from '../../styles/design-tokens'; // Import tokens
import { alpha } from '@mui/material/styles';
const navItems = [
    { name: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
    { name: 'Analytics', view: 'analyticsPage', icon: AnalyticsIcon },
    { name: 'Trades', view: 'tradesList', icon: TradesIcon },
    { name: 'Accounts', view: 'accountsPage', icon: AccountsIcon },
    // { name: 'Watchlist', view: 'watchlist', icon: WatchlistIcon }, // Assuming 'watchlist' view exists
];
export function Sidebar({ open = false, onClose }) {
    const { currentView, navigateTo } = useAppStore();
    const sidebarClass = cn("h-full flex flex-col z-40 transition-transform duration-300 ease-in-out", "border-r", // Use Tailwind for border color controlled by theme
    `w-[${spacing.sidebarWidth}]`, // Use spacing token
    {
        "translate-x-0": open,
        "-translate-x-full": !open && true, // `true` is a placeholder for mobile, desktop is handled by md:static
        "fixed md:static": true, // Fixed on mobile, static on desktop
    });
    const navItemBaseClass = "flex items-center gap-3 px-3 mx-2 py-2.5 rounded-md w-[calc(100%-1rem)] text-left transition-colors duration-150 ease-in-out";
    const navItemTextStyle = `text-[${typography.fontSize.sm}] font-[${typography.fontWeight.medium}]`;
    return (_jsxs("aside", { className: sidebarClass, style: {
            backgroundColor: colors.sidebarBackground, // Use design token
            borderColor: colors.border, // Use design token
        }, role: "navigation", "aria-label": "Sidebar", tabIndex: open ? 0 : -1, children: [_jsx("div", { className: "p-4 flex items-center justify-between", style: {
                    borderBottom: `1px solid ${colors.border}`,
                    height: spacing.topBarHeight, // Match TopBar height
                }, children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex items-center justify-center w-8 h-8 rounded-md", style: { backgroundColor: colors.primary, color: colors.onPrimary }, children: _jsx(Home, { size: 18 }) }), _jsx("h1", { className: "text-lg font-semibold", style: { color: colors.onSurface }, children: "TradeJournal" })] }) }), _jsx("nav", { className: "flex-1 py-4 overflow-y-auto", children: _jsx("ul", { className: "space-y-1", children: navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.view;
                        return (_jsx("li", { children: _jsxs("button", { type: "button", onClick: () => {
                                    navigateTo(item.view);
                                    if (onClose)
                                        onClose(); // Close sidebar on mobile after navigation
                                }, className: cn(navItemBaseClass, navItemTextStyle, {
                                    [`bg-[${alpha(colors.primary, 0.1)}] text-[${colors.primary}]`]: isActive, // Active state
                                    [`text-[${colors.textSecondary}] hover:bg-[${colors.surfaceVariant}] hover:text-[${colors.onSurface}]`]: !isActive, // Inactive state
                                }), style: isActive ? {
                                    backgroundColor: colors.activeNavBackground,
                                    color: colors.activeNavText,
                                } : {
                                    color: colors.textSecondary,
                                }, children: [_jsx(Icon, { size: 20, strokeWidth: isActive ? 2.5 : 2 }), _jsx("span", { children: item.name })] }) }, item.view));
                    }) }) }), _jsx("div", { className: "p-3 mt-auto", style: { borderTop: `1px solid ${colors.border}` }, children: _jsxs("button", { type: "button", onClick: () => {
                        navigateTo('settings'); // Assuming 'settings' view exists
                        if (onClose)
                            onClose();
                    }, className: cn(navItemBaseClass, navItemTextStyle, {
                        [`bg-[${alpha(colors.primary, 0.1)}] text-[${colors.primary}]`]: currentView === 'settings',
                        [`text-[${colors.textSecondary}] hover:bg-[${colors.surfaceVariant}] hover:text-[${colors.onSurface}]`]: currentView !== 'settings',
                    }), style: currentView === 'settings' ? {
                        backgroundColor: colors.activeNavBackground,
                        color: colors.activeNavText,
                    } : {
                        color: colors.textSecondary,
                    }, children: [_jsx(Settings, { size: 20, strokeWidth: currentView === 'settings' ? 2.5 : 2 }), _jsx("span", { children: "Settings" })] }) })] }));
}

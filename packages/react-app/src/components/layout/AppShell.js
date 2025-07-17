import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/react-app/src/components/layout/AppShell.tsx
import { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAppStore } from '../../stores/appStore'; // To close sidebar on view change
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SettingsPage from '../../views/SettingsPage';
export function AppShell({ children }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile); // Open by default on desktop
    const currentView = useAppStore((state) => state.currentView);
    const closeSidebar = useCallback(() => {
        if (isMobile) { // Only close if on mobile
            setSidebarOpen(false);
        }
    }, [isMobile]);
    const toggleSidebar = useCallback(() => {
        setSidebarOpen((open) => !open);
    }, []);
    // Effect to close sidebar on mobile when view changes
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [currentView, isMobile]);
    // Effect to handle sidebar visibility on screen resize
    useEffect(() => {
        setSidebarOpen(!isMobile);
    }, [isMobile]);
    return (_jsxs("div", { className: "flex h-screen bg-background text-on-surface text-sm", children: [_jsx("div", { className: sidebarOpen
                    ? 'transition-all duration-300 w-64 min-w-[16rem] max-w-[16rem]'
                    : 'transition-all duration-300 w-0 min-w-0 max-w-0 overflow-hidden', style: { zIndex: 40 }, children: _jsx(Sidebar, { open: sidebarOpen, onClose: closeSidebar }) }), isMobile && sidebarOpen && (_jsx("div", { className: "fixed inset-0 z-30 bg-black/50 md:hidden", "aria-hidden": "true", onClick: closeSidebar })), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden transition-all duration-300", children: [_jsx(TopBar, { onMenuClick: toggleSidebar }), _jsx("main", { className: "flex-1 overflow-y-auto p-4 md:p-6", children: currentView === 'settings' ? _jsx(SettingsPage, {}) : children })] })] }));
}

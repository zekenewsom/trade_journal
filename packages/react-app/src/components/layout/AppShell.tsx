// packages/react-app/src/components/layout/AppShell.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAppStore } from '../../stores/appStore'; // To close sidebar on view change
import { useMediaQuery, Theme } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SettingsPage from '../../views/SettingsPage';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const theme = useTheme<Theme>();
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

  return (
    <div className="flex h-screen bg-background text-on-surface text-sm">
      {/* Sidebar: width transitions, hidden when retracted */}
      <div
        className={
          sidebarOpen
            ? 'transition-all duration-300 w-64 min-w-[16rem] max-w-[16rem]'
            : 'transition-all duration-300 w-0 min-w-0 max-w-0 overflow-hidden'
        }
        style={{ zIndex: 40 }}
      >
        <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      </div>

      {/* Overlay for mobile sidebar, only when sidebar is open and on mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-hidden="true"
          onClick={closeSidebar}
        />
      )}

      {/* Main content flexes to fill the void */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        <TopBar onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {currentView === 'settings' ? <SettingsPage /> : children}
        </main>
      </div>
    </div>
  );
}
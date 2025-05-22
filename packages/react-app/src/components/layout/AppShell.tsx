import React, { useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change or overlay click
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((open) => !open), []);

  return (
    <div className="flex h-screen text-on-surface bg-background text-sm font-sans">
      {/* Sidebar: overlay on mobile, always visible on desktop */}
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          aria-label="Sidebar overlay"
          onClick={closeSidebar}
          tabIndex={-1}
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-auto p-4 md:p-6 grid grid-cols-12 gap-4">
          {children}
        </main>
      </div>
    </div>
  );
} 
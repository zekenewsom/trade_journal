import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { colors } from '../../styles/design-tokens';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen" style={{ color: colors.textPrimary, background: colors.background, fontSize: '0.875rem' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto p-4 md:p-6 grid grid-cols-12 gap-4">
          {children}
        </main>
      </div>
    </div>
  );
} 
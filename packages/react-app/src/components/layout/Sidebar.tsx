import { BarChart3, LineChart, Settings, Home, LayoutDashboard, Wallet, Star } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAppStore } from '../../stores/appStore';
import type { View } from '../../stores/appStore';

// Remove Link import - navigation is handled via navigateTo

const navItems = [
  { name: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
  { name: 'Portfolio', view: 'portfolio', icon: Wallet },
  { name: 'Analytics', view: 'analyticsPage', icon: BarChart3 },
  { name: 'Trades', view: 'tradesList', icon: LineChart },
  { name: 'Watchlist', view: 'watchlist', icon: Star },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const { currentView, navigateTo } = useAppStore();
  // Sidebar is always visible on md+, only shown on mobile if open
  const sidebarClass = [
    "h-full w-64 md:w-56 flex flex-col bg-surface border-r border-card-stroke z-50 transition-transform duration-200",
    open ? "fixed top-0 left-0 md:static md:translate-x-0 translate-x-0" : "-translate-x-full md:translate-x-0 md:static hidden md:flex",
    "md:h-full md:relative md:flex"
  ].join(' ');

  // Helper to close sidebar on mobile
  const handleNavClick = () => {
    if (onClose && window.innerWidth < 768) onClose();
  };

  return (
    <aside
      className={sidebarClass}
      role="navigation"
      aria-label="Sidebar"
      tabIndex={open ? 0 : -1}
    >
      <div className="p-4 border-b border-card-stroke flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-on-primary">
            <Home size={16} />
          </div>
          <h1 className="text-lg font-semibold hidden md:block text-on-surface">Trade Journal</h1>
        </div>
        {/* Close button on mobile */}
        <button
          className="md:hidden p-2 ml-auto text-on-surface-variant hover:text-primary focus:outline-none"
          aria-label="Close sidebar"
          onClick={onClose}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <li key={item.view}>
                <button
                  type="button"
                  onClick={() => { navigateTo(item.view as View); handleNavClick(); }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left transition-colors',
                    isActive ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-variant'
                  )}
                >
                  <Icon size={18} />
                  <span className="hidden md:inline">{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 mt-auto border-t border-card-stroke">
        <button
          type="button"
          onClick={() => { navigateTo('settings'); handleNavClick(); }}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left transition-colors',
            currentView === 'settings' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-variant'
          )}
        >
          <Settings size={18} />
          <span className="hidden md:inline">Settings</span>
        </button>
      </div>
    </aside>
  );
}
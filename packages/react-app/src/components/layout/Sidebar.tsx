// packages/react-app/src/components/layout/Sidebar.tsx
import {
  LayoutDashboard,
  
  BarChart3 as AnalyticsIcon,
  ListCollapse as TradesIcon,
  Wallet as AccountsIcon,
  Settings,
  Home,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAppStore } from '../../stores/appStore';
import type { View } from '../../stores/appStore';
import { colors, typography, spacing } from '../../styles/design-tokens'; // Import tokens
import { alpha } from '@mui/material/styles';


const navItems = [
  { name: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
  { name: 'Analytics', view: 'analyticsPage', icon: AnalyticsIcon },
  { name: 'Trades', view: 'tradesList', icon: TradesIcon },
  { name: 'Accounts', view: 'accountsPage', icon: AccountsIcon },
  // { name: 'Watchlist', view: 'watchlist', icon: WatchlistIcon }, // Assuming 'watchlist' view exists
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const { currentView, navigateTo } = useAppStore();

  const sidebarClass = cn(
    "h-full flex flex-col z-40 transition-transform duration-300 ease-in-out",
    "border-r", // Use Tailwind for border color controlled by theme
    `w-[${spacing.sidebarWidth}]`, // Use spacing token
    {
      "translate-x-0": open,
      "-translate-x-full": !open && true, // `true` is a placeholder for mobile, desktop is handled by md:static
      "fixed md:static": true, // Fixed on mobile, static on desktop
    }
  );
  
  const navItemBaseClass = "flex items-center gap-3 px-3 mx-2 py-2.5 rounded-md w-[calc(100%-1rem)] text-left transition-colors duration-150 ease-in-out";
  const navItemTextStyle = `text-[${typography.fontSize.sm}] font-[${typography.fontWeight.medium}]`;

  return (
    <aside
      className={sidebarClass}
      style={{
        backgroundColor: colors.sidebarBackground, // Use design token
        borderColor: colors.border, // Use design token
      }}
      role="navigation"
      aria-label="Sidebar"
      tabIndex={open ? 0 : -1}
    >
      <div
        className="p-4 flex items-center justify-between"
        style={{
          borderBottom: `1px solid ${colors.border}`,
          height: spacing.topBarHeight, // Match TopBar height
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-md"
            style={{ backgroundColor: colors.primary, color: colors.onPrimary }}
          >
            <Home size={18} />
          </div>
          <h1
            className="text-lg font-semibold"
            style={{ color: colors.onSurface }}
          >
            TradeJournal
          </h1>
        </div>
        {/* Optional: Close button for mobile if sidebar overlays content and doesn't push it */}
        {/* <button className="md:hidden" onClick={onClose}>Close</button> */}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <li key={item.view}>
                <button
                  type="button"
                  onClick={() => {
                    navigateTo(item.view as View);
                    if (onClose) onClose(); // Close sidebar on mobile after navigation
                  }}
                  className={cn(navItemBaseClass, navItemTextStyle, {
                    [`bg-[${alpha(colors.primary, 0.1)}] text-[${colors.primary}]`]: isActive, // Active state
                    [`text-[${colors.textSecondary}] hover:bg-[${colors.surfaceVariant}] hover:text-[${colors.onSurface}]`]: !isActive, // Inactive state
                  })}
                  style={isActive ? {
                    backgroundColor: colors.activeNavBackground,
                    color: colors.activeNavText,
                  } : {
                    color: colors.textSecondary,
                  }}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className="p-3 mt-auto"
        style={{ borderTop: `1px solid ${colors.border}` }}
      >
        <button
          type="button"
          onClick={() => {
            navigateTo('settings'); // Assuming 'settings' view exists
            if (onClose) onClose();
          }}
          className={cn(navItemBaseClass, navItemTextStyle, {
            [`bg-[${alpha(colors.primary, 0.1)}] text-[${colors.primary}]`]: currentView === 'settings',
            [`text-[${colors.textSecondary}] hover:bg-[${colors.surfaceVariant}] hover:text-[${colors.onSurface}]`]: currentView !== 'settings',
          })}
           style={currentView === 'settings' ? {
            backgroundColor: colors.activeNavBackground,
            color: colors.activeNavText,
          } : {
            color: colors.textSecondary,
          }}
        >
          <Settings size={20} strokeWidth={currentView === 'settings' ? 2.5 : 2} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
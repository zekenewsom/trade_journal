import { BarChart3, LineChart, Settings, Home, LayoutDashboard, Wallet, Star } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { colors } from '../../styles/design-tokens';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Portfolio', path: '/portfolio', icon: Wallet },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Trades', path: '/trades', icon: LineChart },
  { name: 'Watchlist', path: '/watchlist', icon: Star },
];

export function Sidebar() {
  const location = useLocation();
  
  return (
    <aside className="h-full w-16 md:w-56 flex flex-col" style={{ background: colors.surface, borderRight: `1px solid ${colors.border}` }}>
      <div className="p-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-md" style={{ background: colors.primary, color: colors.textPrimary }}>
            <Home size={16} />
          </div>
          <h1 className="text-lg font-semibold hidden md:block" style={{ color: colors.textPrimary }}>Trade Journal</h1>
        </div>
      </div>
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  )}
                  style={{
                    background: isActive ? colors.primary + '1A' : undefined,
                    color: isActive ? colors.primary : colors.textSecondary
                  }}
                >
                  <Icon size={18} />
                  <span className="hidden md:inline">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 mt-auto" style={{ borderTop: `1px solid ${colors.border}` }}>
        <Link 
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
          style={{ color: colors.textSecondary }}
        >
          <Settings size={18} />
          <span className="hidden md:inline">Settings</span>
        </Link>
      </div>
    </aside>
  );
} 
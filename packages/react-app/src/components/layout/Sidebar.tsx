import { BarChart3, LineChart, Settings, Home, LayoutDashboard, Wallet, Star } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';

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
    <aside className="h-full w-16 md:w-56 flex flex-col bg-surface border-r border-card-stroke">
      <div className="p-4 border-b border-card-stroke">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-on-primary">
            <Home size={16} />
          </div>
          <h1 className="text-lg font-semibold hidden md:block text-on-surface">Trade Journal</h1>
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
                    isActive ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-variant'
                  )}
                >
                  <Icon size={18} />
                  <span className="hidden md:inline">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 mt-auto border-t border-card-stroke">
        <Link 
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-on-surface-variant hover:bg-surface-variant"
        >
          <Settings size={18} />
          <span className="hidden md:inline">Settings</span>
        </Link>
      </div>
    </aside>
  );
} 
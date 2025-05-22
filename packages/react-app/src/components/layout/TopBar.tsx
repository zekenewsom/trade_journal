import { Bell, Calendar, Search } from 'lucide-react';
import { format } from 'date-fns';

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const dateRange = {
    start: new Date(2023, 0, 1), // Jan 1, 2023
    end: new Date(2023, 4, 10)   // May 10, 2023
  };
  
  return (
    <header className="h-14 flex items-center justify-between px-4 bg-surface border-b border-card-stroke">
      <div className="flex items-center gap-4">
        {/* Hamburger menu on mobile */}
        <button
          className="md:hidden mr-2 p-2 rounded focus:outline-none text-on-surface-variant hover:text-primary"
          aria-label="Open sidebar"
          onClick={onMenuClick}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <span>Date Range:</span>
          <div className="flex items-center gap-1.5 rounded-md px-2 py-1 bg-surface-variant">
            <Calendar size={14} />
            <span>
              {format(dateRange.start, 'MMM d, yyyy')} - {format(dateRange.end, 'MMM d, yyyy')}
            </span>
          </div>
        </div>
        <div className="hidden md:flex">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-surface-variant text-primary">
            <span className="hidden md:inline">Settings</span> All Strategies
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Search tickers..." 
            className="h-8 pl-8 pr-3 rounded-md w-64 text-sm focus:outline-none focus:ring-1 bg-surface-variant border border-card-stroke text-on-surface"
          />
        </div>
        <button className="p-1.5 rounded-md text-on-surface-variant">
          <Bell size={18} />
        </button>
        <div className="ml-2 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full flex items-center justify-center font-medium bg-primary/20 text-primary">
            ZK
          </div>
        </div>
      </div>
    </header>
  );
} 
import { Bell, Calendar, Search } from 'lucide-react';
import { format } from 'date-fns';
import { colors } from '../../styles/design-tokens';

export function TopBar() {
  const dateRange = {
    start: new Date(2023, 0, 1), // Jan 1, 2023
    end: new Date(2023, 4, 10)   // May 10, 2023
  };
  
  return (
    <header className="h-14 flex items-center justify-between px-4" style={{ background: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs" style={{ color: colors.textSecondary }}>
          <span>Date Range:</span>
          <div className="flex items-center gap-1.5 rounded-md px-2 py-1" style={{ background: colors.surfaceVariant }}>
            <Calendar size={14} />
            <span>
              {format(dateRange.start, 'MMM d, yyyy')} - {format(dateRange.end, 'MMM d, yyyy')}
            </span>
          </div>
        </div>
        
        <div className="hidden md:flex">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs" style={{ background: colors.surfaceVariant, color: colors.primary }}>
            <span className="hidden md:inline">Settings</span> All Strategies
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: colors.textSecondary }} />
          <input 
            type="text" 
            placeholder="Search tickers..." 
            className="h-8 pl-8 pr-3 rounded-md w-64 text-sm focus:outline-none focus:ring-1"
            style={{ background: colors.surfaceVariant, border: `1px solid ${colors.border}`, color: colors.textPrimary }}
          />
        </div>
        
        <button className="p-1.5 rounded-md" style={{ color: colors.textSecondary }}>
          <Bell size={18} />
        </button>
        
        <div className="ml-2 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full flex items-center justify-center font-medium" style={{ background: colors.primary + '33', color: colors.primary }}>
            ZK
          </div>
        </div>
      </div>
    </header>
  );
} 
import { Bell, Calendar, Search } from 'lucide-react';
import { format } from 'date-fns';

export function TopBar() {
  const dateRange = {
    start: new Date(2023, 0, 1), // Jan 1, 2023
    end: new Date(2023, 4, 10)   // May 10, 2023
  };
  
  return (
    <header className="h-14 border-b border-stroke bg-[#131417] flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Date Range:</span>
          <div className="flex items-center gap-1.5 bg-[#1d1f25] rounded-md px-2 py-1">
            <Calendar size={14} />
            <span>
              {format(dateRange.start, 'MMM d, yyyy')} - {format(dateRange.end, 'MMM d, yyyy')}
            </span>
          </div>
        </div>
        
        <div className="hidden md:flex">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-dark-600 text-xs text-primary">
            <span className="font-medium">Strategy:</span> All Strategies
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search tickers..." 
            className="h-8 pl-8 pr-3 bg-dark-600 border border-stroke/50 rounded-md w-64 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        
        <button className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-dark-600">
          <Bell size={18} />
        </button>
        
        <div className="ml-2 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
            ZK
          </div>
        </div>
      </div>
    </header>
  );
} 
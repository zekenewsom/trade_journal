import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Bell, Calendar, Search } from 'lucide-react';
import { format } from 'date-fns';
export function TopBar() {
    const dateRange = {
        start: new Date(2023, 0, 1), // Jan 1, 2023
        end: new Date(2023, 4, 10) // May 10, 2023
    };
    return (_jsxs("header", { className: "h-14 border-b border-stroke bg-[#131417] flex items-center justify-between px-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-400", children: [_jsx("span", { children: "Date Range:" }), _jsxs("div", { className: "flex items-center gap-1.5 bg-[#1d1f25] rounded-md px-2 py-1", children: [_jsx(Calendar, { size: 14 }), _jsxs("span", { children: [format(dateRange.start, 'MMM d, yyyy'), " - ", format(dateRange.end, 'MMM d, yyyy')] })] })] }), _jsx("div", { className: "hidden md:flex", children: _jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 rounded bg-dark-600 text-xs text-primary", children: [_jsx("span", { className: "font-medium", children: "Strategy:" }), " All Strategies"] }) })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "relative hidden md:block", children: [_jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search tickers...", className: "h-8 pl-8 pr-3 bg-dark-600 border border-stroke/50 rounded-md w-64 text-sm focus:outline-none focus:ring-1 focus:ring-primary" })] }), _jsx("button", { className: "p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-dark-600", children: _jsx(Bell, { size: 18 }) }), _jsx("div", { className: "ml-2 flex items-center gap-2", children: _jsx("div", { className: "h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium", children: "ZK" }) })] })] }));
}

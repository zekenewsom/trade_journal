import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs("aside", { className: "h-full w-16 md:w-56 bg-[#131417] border-r border-stroke flex flex-col", children: [_jsx("div", { className: "p-4 border-b border-stroke", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex items-center justify-center w-8 h-8 rounded-md bg-primary text-white", children: _jsx(Home, { size: 16 }) }), _jsx("h1", { className: "text-lg font-semibold hidden md:block", children: "Trade Journal" })] }) }), _jsx("nav", { className: "flex-1 py-4", children: _jsx("ul", { className: "space-y-1 px-2", children: navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (_jsx("li", { children: _jsxs(Link, { to: item.path, className: cn('flex items-center gap-3 px-3 py-2 rounded-lg transition-colors', isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-400 hover:text-white hover:bg-dark-600'), children: [_jsx(Icon, { size: 18 }), _jsx("span", { className: "hidden md:inline", children: item.name })] }) }, item.path));
                    }) }) }), _jsx("div", { className: "p-4 border-t border-stroke mt-auto", children: _jsxs(Link, { to: "/settings", className: "flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors", children: [_jsx(Settings, { size: 18 }), _jsx("span", { className: "hidden md:inline", children: "Settings" })] }) })] }));
}

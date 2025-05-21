import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
export function AppShell({ children }) {
    return (_jsxs("div", { className: "flex h-screen text-sm text-white bg-bg", children: [_jsx(Sidebar, {}), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsx(TopBar, {}), _jsx("main", { className: "flex-1 overflow-auto p-4 md:p-6 grid grid-cols-12 gap-4", children: children })] })] }));
}

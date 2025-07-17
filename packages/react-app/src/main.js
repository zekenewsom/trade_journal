import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { darkTheme } from './theme'; // Basic global styles (can be Tailwind later)
ReactDOM.createRoot(document.getElementById('root')).render(
// <React.StrictMode>
_jsxs(ThemeProvider, { theme: darkTheme, children: [_jsx(CssBaseline, {}), _jsx(BrowserRouter, { children: _jsx(App, {}) })] })
// </React.StrictMode>,
);

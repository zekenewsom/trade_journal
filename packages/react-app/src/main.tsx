// File: trade_journal/packages/react-app/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App';
import './index.css';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { darkTheme } from './theme'; // Basic global styles (can be Tailwind later)

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
  // </React.StrictMode>,
);
import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8be9fd', // Cyan
    },
    secondary: {
      main: '#ff79c6', // Pink
    },
    background: {
      default: '#161a25', // Main background
      paper: '#1e2230',   // Card background
    },
    text: {
      primary: '#f8f8f2',  // Light text
      secondary: '#bd93f9',// Purple-ish text
    },
    success: {
      main: '#50fa7b', // Green
    },
    error: {
      main: '#ff5555',   // Red
    },
    info: {
      main: '#8be9fd',
    },
    warning: {
      main: '#f1fa8c', // Yellow
    }
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h4: { fontWeight: 700, color: '#f8f8f2' },
    h5: { fontWeight: 600, color: '#f8f8f2' },
    h6: { color: '#50fa7b', fontWeight: 500, marginBottom: '1rem' }, // Section titles
    subtitle1: { color: '#8be9fd' }, // Card titles
    subtitle2: { color: '#bd93f9' }, // Card subtitles/descriptions
    body1: { color: '#f8f8f2'},
    caption: { color: '#6272a4'} // Dimmer text
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove MUI's default gradient on Paper in dark mode
          borderRadius: '8px',
          boxShadow: '0px 4px 12px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          textTransform: 'none',
        }
      }
    },
    // Style Recharts tooltips if possible via global CSS or wrapper components
  },
});

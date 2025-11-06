import { createTheme } from '@mui/material';

export const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#1976d2', // A classic, reliable blue
    },
    secondary: {
      main: '#673ab7',
    },
    info: {
      main: '#0288d1',
    },
    background: {
      default: mode === 'light' ? '#f4f6f8' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
    text: {
      primary: mode === 'light' ? '#172b4d' : '#ffffff',
      secondary: mode === 'light' ? '#6b778c' : '#b0b0b0',
    },
  },
  typography: {
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontWeight: 700,
      color: mode === 'light' ? '#172b4d' : '#ffffff',
    },
    h5: {
      fontWeight: 600,
      color: mode === 'light' ? '#172b4d' : '#ffffff',
    },
    h6: {
      fontWeight: 600,
      color: mode === 'light' ? '#42526e' : '#e0e0e0',
      letterSpacing: '0.5px'
    },
    body1: {
      fontSize: '1rem',
      color: mode === 'light' ? '#42526e' : '#e0e0e0',
    },
    body2: {
      fontSize: '0.875rem',
      color: mode === 'light' ? '#6b778c' : '#b0b0b0',
    },
    subtitle1: {
        fontSize: '1.1rem',
        fontWeight: 600,
    }
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light' 
            ? 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px' 
            : 'rgba(0, 0, 0, 0.3) 0px 1px 2px 0px',
          border: mode === 'light' 
            ? '1px solid #dfe1e6' 
            : '1px solid rgba(255, 255, 255, 0.12)',
          height: '100%',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        }
      }
    }
  },
});
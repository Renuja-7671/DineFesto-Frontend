import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3B82F6', // Vibrant blue
      light: '#60A5FA',
      dark: '#2563EB',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2C3E50', // Dark blue-grey
      light: '#455A64',
      dark: '#1A252F',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4CAF50',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#546E7A',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.4,
    },
    h4: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 500,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '1rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          },
          transition: 'box-shadow 0.3s ease-in-out',
        },
      },
    },
  },
});

export default theme;

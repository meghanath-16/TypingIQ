import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#090d16',
      paper: '#0f172a',
    },
    primary: {
      main: '#f59e0b',
      contrastText: '#000000',
    },
    secondary: {
      main: '#94a3b8',
      contrastText: '#ffffff',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      disabled: '#475569',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: [
      'Plus Jakarta Sans',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          fontWeight: 600,
          fontSize: '0.8125rem',
          letterSpacing: '0.01em',
          padding: '8px 18px',
          transition: 'all 0.18s ease',
        },
        contained: {
          backgroundColor: '#f59e0b',
          color: '#000000',
          boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.25)',
          '&:hover': {
            backgroundColor: '#fbbf24',
            boxShadow: '0 6px 20px rgba(245, 158, 11, 0.35)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.15)',
          color: '#f8fafc',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.35)',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 600,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: '#f8fafc',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '8px',
          fontSize: '0.75rem',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#0f172a',
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
  },
});

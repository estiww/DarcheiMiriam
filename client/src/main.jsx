import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';

// יצירת ערכת נושא מותאמת אישית עם פונט גדול יותר

const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, Assistant, Arial, sans-serif',
    fontSize: 18,
    fontWeightRegular: 500, // Increased from default 400
    fontWeightMedium: 600, // Increased from default 500
    fontWeightBold: 700,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1.1rem',
      fontWeight: 500,
    },
    body2: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  palette: {
    primary: {
      main: '#b6247e',
    },
    secondary: {
      main: '#2abbb4',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          font-family: 'Rubik', Assistant, Arial, sans-serif;
          font-size: 18px;
          font-weight: 500;
        }

        ::selection {
          background-color: #2abbb4;
          color: white;
        }
      `,
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2abbb4',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: '#2abbb4',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '1.1rem',
          fontWeight: 600,
        },
      },
    },
  },
});

// יצירת מטמון עבור סגנונות RTL
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </CacheProvider>
  </React.StrictMode>,
)
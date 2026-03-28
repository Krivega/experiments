import { createTheme } from '@mui/material/styles';

/** Matches scripts/custom.css :root (prefers-color-scheme: dark) light palette. */
const bg = '#ffffff';
const text = '#2A2B2E';
const textLight = '#585858';
const accent = '#3A405A';
const accentHover = '#335899';
const accentBg = '#2A2B2E';
const code = '#d81b60';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: accent,
      light: '#6D7594',
      dark: accentHover,
      contrastText: bg,
    },
    secondary: {
      main: code,
      light: '#e06090',
      dark: '#9a1247',
      contrastText: bg,
    },
    text: {
      primary: text,
      secondary: textLight,
      disabled: '#cccccc',
    },
    background: {
      default: bg,
      paper: bg,
    },
    divider: 'rgba(42, 43, 46, 0.12)',
    action: {
      active: text,
      disabled: '#cccccc',
      disabledBackground: '#cccccc',
    },
    /** custom.css --accent-bg / --accent-text */
    appBar: {
      main: accentBg,
      contrastText: bg,
    },
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        color: 'default',
      },
      styleOverrides: {
        root: ({ theme }) => {
          return {
            backgroundColor: theme.palette.appBar.main,
            color: theme.palette.appBar.contrastText,
          };
        },
      },
    },
  },
});

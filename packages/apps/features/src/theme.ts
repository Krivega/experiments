import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3A405A',
      contrastText: '#fff',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
});

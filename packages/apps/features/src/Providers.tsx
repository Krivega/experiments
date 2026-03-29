import { ThemeProvider } from '@mui/material/styles';

import { RouterShell } from './RouterShell';
import { appTheme } from './theme';

export const Providers = () => {
  return (
    <ThemeProvider theme={appTheme}>
      <RouterShell />
    </ThemeProvider>
  );
};

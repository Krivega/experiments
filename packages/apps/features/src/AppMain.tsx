import Box from '@mui/material/Box';

import { AppMainContent } from './AppMainContent';

export const AppMain = () => {
  return (
    <Box component="main" sx={{ flex: 1, py: 3 }}>
      <AppMainContent />
    </Box>
  );
};

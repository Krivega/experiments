import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

import { AppMain } from './AppMain';
import { AppToolbarNav } from './nav/AppToolbarNav';

const App = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />

      <AppBar position="sticky">
        <AppToolbarNav />
      </AppBar>

      <AppMain />
    </Box>
  );
};

export default App;

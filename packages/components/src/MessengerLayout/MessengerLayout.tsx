import Box from '@mui/material/Box';

import type { FC, PropsWithChildren } from 'react';

const MessengerLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        width: '100%',
      }}
    >
      {children}
    </Box>
  );
};

export default MessengerLayout;

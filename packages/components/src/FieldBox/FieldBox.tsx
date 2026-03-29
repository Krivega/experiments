import Box from '@mui/material/Box';

import type { FC, PropsWithChildren } from 'react';

const FieldBox: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderColor: 'divider',
        borderRadius: 1,
        borderStyle: 'solid',
        borderWidth: 1,
        boxSizing: 'border-box',
        p: 2,
      }}
    >
      {children}
    </Box>
  );
};

export default FieldBox;

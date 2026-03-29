import Stack from '@mui/material/Stack';

import type { FC, PropsWithChildren } from 'react';

const AsideHeader: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Stack
      alignItems="center"
      component="header"
      direction="row"
      justifyContent="space-between"
      sx={{ boxSizing: 'border-box', columnGap: 1, width: '100%' }}
    >
      {children}
    </Stack>
  );
};

export default AsideHeader;

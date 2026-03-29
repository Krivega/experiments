import Box from '@mui/material/Box';

import type { FC, PropsWithChildren } from 'react';

export type TActionProps = {
  grow?: boolean;
  noShrink?: boolean;
};

const Action: FC<PropsWithChildren<TActionProps>> = ({ children, grow, noShrink }) => {
  return (
    <Box
      sx={{
        flexGrow: grow === true ? 1 : 0,
        flexShrink: noShrink === true ? 0 : 1,
        minWidth: grow === true ? 0 : undefined,
      }}
    >
      {children}
    </Box>
  );
};

export default Action;

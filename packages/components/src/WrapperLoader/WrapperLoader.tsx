import Box from '@mui/material/Box';

import type { FC, PropsWithChildren } from 'react';

export type TWrapperLoaderProps = {
  flex?: boolean;
};

const WrapperLoader: FC<PropsWithChildren<TWrapperLoaderProps>> = ({ children, flex }) => {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: flex === true ? 'flex' : 'block',
        justifyContent: 'center',
      }}
    >
      {children}
    </Box>
  );
};

export default WrapperLoader;

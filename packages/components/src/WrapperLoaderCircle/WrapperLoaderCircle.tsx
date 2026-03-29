import Box from '@mui/material/Box';

import type { FC, PropsWithChildren } from 'react';

export type TWrapperLoaderCircleProps = {
  large?: boolean;
};

const WrapperLoaderCircle: FC<PropsWithChildren<TWrapperLoaderCircleProps>> = ({
  children,
  large,
}) => {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        minHeight: large === true ? 160 : undefined,
        width: '100%',
      }}
    >
      {children}
    </Box>
  );
};

export default WrapperLoaderCircle;

import Box from '@mui/material/Box';

import type { FC, PropsWithChildren } from 'react';

export type TAlignContainerProps = {
  fullHeight?: boolean;
  horizontal?: 'center';
  vertical?: 'center';
};

const AlignContainer: FC<PropsWithChildren<TAlignContainerProps>> = ({
  children,
  fullHeight,
  horizontal,
  vertical,
}) => {
  return (
    <Box
      sx={{
        alignItems: vertical === 'center' ? 'center' : undefined,
        display: 'flex',
        height: fullHeight === true ? '100%' : undefined,
        justifyContent: horizontal === 'center' ? 'center' : undefined,
        minHeight: fullHeight === true ? '100%' : undefined,
        width: '100%',
      }}
    >
      {children}
    </Box>
  );
};

export default AlignContainer;

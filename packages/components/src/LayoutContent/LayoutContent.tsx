import Box from '@mui/material/Box';

import type { FC, PropsWithChildren } from 'react';

export type TLayoutContentProps = {
  centered?: boolean;
  column?: boolean;
};

const LayoutContent: FC<PropsWithChildren<TLayoutContentProps>> = ({
  centered,
  children,
  column,
}) => {
  return (
    <Box
      sx={{
        alignItems: centered === true ? 'center' : undefined,
        display: 'flex',
        flex: 1,
        flexDirection: column === true ? 'column' : 'row',
        justifyContent: centered === true ? 'center' : undefined,
        width: '100%',
      }}
    >
      {children}
    </Box>
  );
};

export default LayoutContent;

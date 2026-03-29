import Stack from '@mui/material/Stack';

import type { FC, PropsWithChildren } from 'react';

export type TActionsProps = {
  toCenter?: boolean;
};

const Actions: FC<PropsWithChildren<TActionsProps>> = ({ children, toCenter }) => {
  return (
    <Stack
      useFlexGap
      alignItems="center"
      direction="row"
      justifyContent={toCenter === true ? 'center' : 'flex-start'}
      spacing={1}
      sx={{ width: '100%' }}
    >
      {children}
    </Stack>
  );
};

export default Actions;

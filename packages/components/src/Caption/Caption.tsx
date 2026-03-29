import Typography from '@mui/material/Typography';

import type { FC, PropsWithChildren } from 'react';

export type TCaptionProps = {
  nowrap?: boolean;
  testid?: string;
};

const Caption: FC<PropsWithChildren<TCaptionProps>> = ({ children, nowrap, testid }) => {
  return (
    <Typography
      data-testid={testid}
      sx={{ whiteSpace: nowrap === true ? 'nowrap' : 'normal' }}
      variant="caption"
    >
      {children}
    </Typography>
  );
};

export default Caption;

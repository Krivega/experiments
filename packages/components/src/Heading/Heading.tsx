import Typography from '@mui/material/Typography';

import type { TypographyProps } from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';

export type THeadingProps = {
  testid?: string;
  type?: TypographyProps['variant'];
};

const Heading: FC<PropsWithChildren<THeadingProps>> = ({ children, testid, type = 'body1' }) => {
  return (
    <Typography component="h2" data-testid={testid} variant={type}>
      {children}
    </Typography>
  );
};

export default Heading;

import Typography from '@mui/material/Typography';

import type { FC, PropsWithChildren } from 'react';

const TitleOverline: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Typography component="div" sx={{ display: 'block', mb: 1 }} variant="overline">
      {children}
    </Typography>
  );
};

export default TitleOverline;

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

import type { TClasses } from '../useStyles';

type TProps = {
  classes: TClasses;
  isLoading: boolean;
};

const PageLoader: React.FC<TProps> = ({ classes, isLoading }) => {
  return (
    <Backdrop className={classes.backdrop} open={isLoading}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default PageLoader;

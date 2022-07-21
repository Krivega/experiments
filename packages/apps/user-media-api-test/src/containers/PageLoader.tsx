import React from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
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

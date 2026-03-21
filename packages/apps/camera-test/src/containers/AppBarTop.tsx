import AppBar from '@mui/material/AppBar';
import ButtonGroup from '@mui/material/ButtonGroup';
import Icon from '@mui/material/Icon';
import React from 'react';

import ButtonAction from './ButtonAction';

import type { TClasses } from '../useStyles';

type TProps = {
  classes: TClasses;
  requestStream: () => void;
  resetState: () => void;
};

const AppBarTop: React.FC<TProps> = ({ classes, requestStream, resetState }) => {
  return (
    <AppBar className={classes.appBar} position="fixed">
      <ButtonGroup className={classes.buttonGroup}>
        <ButtonAction
          classes={classes}
          color="primary"
          icon={<Icon className={classes.extendedIcon}>Tv</Icon>}
          onClick={requestStream}
        >
          Request
        </ButtonAction>

        <ButtonAction
          classes={classes}
          color="default"
          icon={<Icon className={classes.extendedIcon}>RotateLeft</Icon>}
          onClick={resetState}
        >
          Reset
        </ButtonAction>
      </ButtonGroup>
    </AppBar>
  );
};

export default AppBarTop;

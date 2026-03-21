import RotateLeft from '@mui/icons-material/RotateLeft';
import Tv from '@mui/icons-material/Tv';
import AppBar from '@mui/material/AppBar';
import ButtonGroup from '@mui/material/ButtonGroup';
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
          icon={<Tv className={classes.extendedIcon} fontSize="small" />}
          onClick={requestStream}
        >
          Request
        </ButtonAction>

        <ButtonAction
          classes={classes}
          color="default"
          icon={<RotateLeft className={classes.extendedIcon} fontSize="small" />}
          onClick={resetState}
        >
          Reset
        </ButtonAction>
      </ButtonGroup>
    </AppBar>
  );
};

export default AppBarTop;

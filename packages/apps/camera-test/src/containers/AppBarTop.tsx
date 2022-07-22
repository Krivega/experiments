import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import TvIcon from '@material-ui/icons/Tv';
import ButtonAction from './ButtonAction';
import type { TClasses } from '../useStyles';

type TProps = {
  classes: TClasses;
  requestStream: () => void;
  resetState: () => void;
};

const AppBarTop: React.FC<TProps> = ({ classes, requestStream, resetState }) => {
  return (
    <AppBar position="fixed" className={classes.appBar}>
      <ButtonGroup className={classes.buttonGroup}>
        <ButtonAction
          classes={classes}
          icon={<TvIcon className={classes.extendedIcon} />}
          onClick={requestStream}
          color="primary"
        >
          Request
        </ButtonAction>
        <ButtonAction
          classes={classes}
          icon={<RotateLeftIcon className={classes.extendedIcon} />}
          onClick={resetState}
          color="default"
        >
          Reset
        </ButtonAction>
      </ButtonGroup>
    </AppBar>
  );
};

export default AppBarTop;

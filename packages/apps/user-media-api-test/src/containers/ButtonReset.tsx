import React from 'react';
import Fab from '@material-ui/core/Fab';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';

const ButtonReset = ({ classes, resetState, children }) => {
  return (
    <div className={classes.flex}>
      <Fab variant="extended" color="primary" onClick={resetState}>
        <RotateLeftIcon className={classes.extendedIcon} />
        {children}
      </Fab>
    </div>
  );
};

export default ButtonReset;

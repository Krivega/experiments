import React from 'react';
import Fab from '@material-ui/core/Fab';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';

const ButtonAction = ({ classes, onClick, children }) => {
  return (
    <div className={classes.flex}>
      <Fab variant="extended" color="primary" onClick={onClick}>
        <RotateLeftIcon className={classes.extendedIcon} />
        {children}
      </Fab>
    </div>
  );
};

export default ButtonAction;

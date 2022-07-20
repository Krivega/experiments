import React from 'react';
import Fab from '@material-ui/core/Fab';

const ButtonAction = ({ classes, onClick, children, icon }) => {
  return (
    <div className={classes.flex}>
      <Fab variant="extended" color="primary" onClick={onClick}>
        {icon}
        {children}
      </Fab>
    </div>
  );
};

export default ButtonAction;

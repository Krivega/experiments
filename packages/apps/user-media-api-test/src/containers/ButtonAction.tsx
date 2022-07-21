import React from 'react';
import Fab from '@material-ui/core/Fab';
import type { TClasses } from '../useStyles';

type TProps = {
  classes: TClasses;
  children: React.ReactNode;
  icon: JSX.Element;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const ButtonAction: React.FC<TProps> = ({ classes, onClick, children, icon }) => {
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

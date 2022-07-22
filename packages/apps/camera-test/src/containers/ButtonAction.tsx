import React from 'react';
import Fab from '@material-ui/core/Fab';
import type { TClasses } from '../useStyles';

type TProps = {
  classes: TClasses;
  children: React.ReactNode;
  color: 'inherit' | 'primary' | 'secondary' | 'default';
  icon: JSX.Element;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const ButtonAction: React.FC<TProps> = ({ classes, onClick, color, children, icon }) => {
  return (
    <div className={classes.flex}>
      <Fab variant="extended" color={color} onClick={onClick}>
        {icon}
        {children}
      </Fab>
    </div>
  );
};

export default ButtonAction;

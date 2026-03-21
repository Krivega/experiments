import Fab from '@mui/material/Fab';
import React from 'react';

import type { TClasses } from '../useStyles';

type TProps = {
  classes: TClasses;
  children: React.ReactNode;
  color: 'inherit' | 'primary' | 'secondary' | 'default';
  icon: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const ButtonAction: React.FC<TProps> = ({ classes, onClick, color, children, icon }) => {
  return (
    <div className={classes.flex}>
      <Fab color={color} variant="extended" onClick={onClick}>
        {icon}

        {children}
      </Fab>
    </div>
  );
};

export default ButtonAction;

/* eslint-disable react/boolean-prop-naming -- flat/mini match View.tsx Fab API */
import MuiFab from '@mui/material/Fab';

import { Icon } from '../Icon';

import type { FC } from 'react';
import type { TIconName } from '../Icon';

export type TFabProps = {
  color?: string;
  flat?: boolean;
  icon: TIconName;
  mini?: boolean;
  testid?: string;
  title?: string;
  onClick?: () => void;
};

const Fab: FC<TFabProps> = ({ color, flat, icon, mini, testid, title, onClick }) => {
  return (
    <MuiFab
      color="primary"
      data-testid={testid}
      size={mini === true ? 'small' : 'medium'}
      sx={{
        backgroundColor: color === 'transparent' ? 'transparent' : undefined,
        boxShadow: flat === true ? 'none' : undefined,
      }}
      title={title}
      onClick={onClick}
    >
      <Icon icon={icon} size="medium" />
    </MuiFab>
  );
};

export default Fab;

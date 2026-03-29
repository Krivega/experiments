/* eslint-disable react/boolean-prop-naming -- active matches Menu IconButton */
import MuiIconButton from '@mui/material/IconButton';

import { Icon } from '../Icon';

import type { FC } from 'react';
import type { TIconName } from '../Icon';

export type TIconButtonProps = {
  active?: boolean;
  icon: TIconName;
  testid?: string;
  onClick?: () => void;
};

const IconButton: FC<TIconButtonProps> = ({ active, icon, testid, onClick }) => {
  return (
    <MuiIconButton
      color={active === true ? 'primary' : 'default'}
      data-testid={testid}
      onClick={onClick}
    >
      <Icon icon={icon} size="small" />
    </MuiIconButton>
  );
};

export default IconButton;

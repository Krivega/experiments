import Box from '@mui/material/Box';
import MuiButton from '@mui/material/Button';

import { Icon } from '../Icon';

import type { FC, PropsWithChildren, ReactNode } from 'react';
import type { TIconName } from '../Icon';

export type TButtonProps = {
  color?: 'gray';
  disabled?: boolean;
  icon?: TIconName;
  loader?: ReactNode;
  onClick?: () => void;
  raised?: boolean;
  rounded?: boolean;
  size?: 'smallest' | 'wide';
  testid?: string;
  title?: string;
};

const Button: FC<PropsWithChildren<TButtonProps>> = ({
  children,
  color,
  disabled,
  icon,
  loader,
  onClick,
  raised,
  rounded,
  size,
  testid,
  title,
}) => {
  const content = (
    <Box sx={{ alignItems: 'center', display: 'inline-flex', gap: 1 }}>
      {loader}

      {icon === undefined ? undefined : <Icon color="gray" icon={icon} size="small" />}

      {children}
    </Box>
  );

  return (
    <MuiButton
      data-testid={testid}
      disabled={disabled === true}
      sx={{
        borderRadius: rounded === true ? 9999 : undefined,
        color: color === 'gray' ? 'text.secondary' : undefined,
        minWidth: size === 'wide' ? 200 : undefined,
        ...(size === 'smallest' ? { fontSize: '0.75rem', minHeight: 28, px: 1, py: 0.25 } : {}),
      }}
      title={title}
      variant={raised === true ? 'contained' : 'text'}
      onClick={onClick}
    >
      {content}
    </MuiButton>
  );
};

export default Button;

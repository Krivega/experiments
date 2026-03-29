import MuiListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import type { FC, PropsWithChildren, ReactNode } from 'react';

export type TListItemProps = {
  disabled?: boolean;
  graphic: ReactNode;
  testid?: string;
  /** `popup`: compact row for menus; `default`: standard list density */
  variant?: 'default' | 'popup';
  onClick?: () => void;
};

const ListItem: FC<PropsWithChildren<TListItemProps>> = ({
  children,
  disabled = false,
  graphic,
  testid,
  variant = 'popup',
  onClick,
}) => {
  return (
    <MuiListItem disablePadding>
      <ListItemButton
        data-testid={testid}
        dense={variant === 'popup'}
        disabled={disabled}
        onClick={onClick}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>{graphic}</ListItemIcon>

        <ListItemText primary={children} />
      </ListItemButton>
    </MuiListItem>
  );
};

export default ListItem;

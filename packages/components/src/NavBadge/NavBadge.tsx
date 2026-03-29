import Chip from '@mui/material/Chip';

import type { FC, PropsWithChildren } from 'react';

export type TNavBadgeProps = {
  testid?: string;
};

const NavBadge: FC<PropsWithChildren<TNavBadgeProps>> = ({ children, testid }) => {
  return <Chip data-testid={testid} label={children} size="small" variant="outlined" />;
};

export default NavBadge;

import Avatar from '@mui/material/Avatar';

import type { FC, PropsWithChildren } from 'react';

const UserAvatar: FC<PropsWithChildren> = ({ children }) => {
  return <Avatar sx={{ fontSize: 14, height: 32, width: 32 }}>{children}</Avatar>;
};

export default UserAvatar;

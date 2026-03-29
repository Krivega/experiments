import MuiList from '@mui/material/List';

import type { FC, PropsWithChildren } from 'react';

export type TListProps = {
  compact?: boolean;
  testid?: string;
};

const List: FC<PropsWithChildren<TListProps>> = ({ children, compact, testid }) => {
  return (
    <MuiList data-testid={testid} dense={compact === true} sx={{ width: '100%' }}>
      {children}
    </MuiList>
  );
};

export default List;

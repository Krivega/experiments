/* eslint-disable react/boolean-prop-naming -- paddingBig matches Header.tsx */
import MuiDivider from '@mui/material/Divider';

import type { FC } from 'react';

export type TDividerProps = {
  paddingBig?: boolean;
};

const Divider: FC<TDividerProps> = ({ paddingBig }) => {
  return <MuiDivider sx={paddingBig === true ? { my: 3 } : undefined} />;
};

export default Divider;

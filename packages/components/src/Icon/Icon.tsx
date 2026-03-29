import { ICON_COMPONENTS } from './iconComponents';

import type { SvgIconProps } from '@mui/material/SvgIcon';
import type { FC } from 'react';

export type TIconProps = {
  icon: keyof typeof ICON_COMPONENTS;
  color?: 'gray';
  size?: SvgIconProps['fontSize'];
};

const colorSx = {
  gray: { color: 'text.secondary' },
} as const;

const Icon: FC<TIconProps> = ({ icon, color, size = 'medium' }) => {
  const MuiIcon = ICON_COMPONENTS[icon];

  return <MuiIcon fontSize={size} sx={color ? colorSx[color] : undefined} />;
};

export default Icon;

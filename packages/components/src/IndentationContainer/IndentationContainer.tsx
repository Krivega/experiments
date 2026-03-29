import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import type { FC, PropsWithChildren } from 'react';

export type TIndentSize = 'large' | 'middle' | 'small';

export type TIndentationContainerProps = {
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  top?: boolean;
  bottomSize?: TIndentSize;
  leftSize?: TIndentSize;
  rightSize?: TIndentSize;
  topSize?: TIndentSize;
};

const SIZE_TO_SPACING_UNIT: Record<TIndentSize, number> = {
  small: 1,
  middle: 2,
  large: 3,
};

const resolvePadding = (
  isOff: boolean | undefined,
  size: TIndentSize | undefined,
  spacingUnit: (value: number) => string,
): string => {
  if (isOff === false) {
    return spacingUnit(0);
  }

  if (size) {
    return spacingUnit(SIZE_TO_SPACING_UNIT[size]);
  }

  return spacingUnit(2);
};

const IndentationContainer: FC<PropsWithChildren<TIndentationContainerProps>> = ({
  bottom,
  bottomSize,
  children,
  left,
  leftSize,
  right,
  rightSize,
  top,
  topSize,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        boxSizing: 'border-box',
        paddingBottom: resolvePadding(bottom, bottomSize, theme.spacing),
        paddingLeft: resolvePadding(left, leftSize, theme.spacing),
        paddingRight: resolvePadding(right, rightSize, theme.spacing),
        paddingTop: resolvePadding(top, topSize, theme.spacing),
      }}
    >
      {children}
    </Box>
  );
};

export default IndentationContainer;

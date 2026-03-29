import Typography from '@mui/material/Typography';

import type { TypographyProps } from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';

export type TTextProps = {
  centered?: boolean;
  color?: 'hint' | 'on-secondary';
  dataValue?: string | number;
  testid?: string;
  type?: 'heading-secondary' | 'inherit';
  width?: number;
};

const variantFromType = (type: TTextProps['type']): TypographyProps['variant'] => {
  if (type === 'heading-secondary') {
    return 'subtitle2';
  }

  if (type === 'inherit') {
    return 'inherit';
  }

  return 'body2';
};

const Text: FC<PropsWithChildren<TTextProps>> = ({
  centered,
  children,
  color,
  dataValue,
  testid,
  type,
  width,
}) => {
  let sxColor: { color: string } | undefined;

  if (color === 'hint') {
    sxColor = { color: 'text.secondary' };
  } else if (color === 'on-secondary') {
    sxColor = { color: 'secondary.main' };
  } else {
    sxColor = undefined;
  }

  return (
    <Typography
      data-testid={testid}
      data-value={dataValue}
      sx={{
        ...sxColor,
        ...(width === undefined
          ? {}
          : {
              maxWidth: width,
              width: '100%',
            }),
        textAlign: centered === true ? 'center' : undefined,
      }}
      variant={variantFromType(type)}
    >
      {children}
    </Typography>
  );
};

export default Text;

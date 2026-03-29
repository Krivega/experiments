import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import type { FC } from 'react';

export type TLoaderCircleProps = {
  // eslint-disable-next-line react/boolean-prop-naming -- API used by @experiments/features
  active?: boolean;
  alignment?: 'center';
  // eslint-disable-next-line react/boolean-prop-naming -- API used by @experiments/features
  backdrop?: boolean;
  size?: 'large' | 'small';
  testid?: string;
};

const progressSizePx = (size: TLoaderCircleProps['size']): number => {
  return size === 'small' ? 24 : 40;
};

const LoaderCircle: FC<TLoaderCircleProps> = ({
  active,
  alignment,
  backdrop,
  size = 'large',
  testid,
}) => {
  if (active === false) {
    return undefined;
  }

  const dimension = progressSizePx(size);

  const progress = <CircularProgress data-testid={testid} size={dimension} />;

  if (backdrop === true) {
    return (
      <Backdrop
        open
        sx={{
          color: 'common.white',
          zIndex: (theme) => {
            return theme.zIndex.modal + 1;
          },
        }}
      >
        {progress}
      </Backdrop>
    );
  }

  if (alignment === 'center') {
    return <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>{progress}</Box>;
  }

  return progress;
};

export default LoaderCircle;

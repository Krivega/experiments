import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

import type { FC } from 'react';

export type TStepperProgressProps = {
  current: number;
  total: number;
};

const StepperProgress: FC<TStepperProgressProps> = ({ current, total }) => {
  const value = total <= 0 ? 0 : Math.min(100, (current / total) * 100);

  return (
    <Box sx={{ mt: 0.5, width: '100%' }}>
      <LinearProgress value={value} variant="determinate" />
    </Box>
  );
};

export default StepperProgress;

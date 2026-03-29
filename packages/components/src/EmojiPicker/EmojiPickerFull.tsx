import Box from '@mui/material/Box';
import MuiIconButton from '@mui/material/IconButton';

import { emotions } from './emotions';

import type { FC } from 'react';
import type { TEmotion } from './emotions';

export type TEmojiPickerFullProps = {
  testid?: string;
  onSelect: (emotion: TEmotion) => void;
};

const EmojiPickerFull: FC<TEmojiPickerFullProps> = ({ testid, onSelect }) => {
  const keys = Object.keys(emotions) as TEmotion[];

  return (
    <Box
      data-testid={testid}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.5,
        maxWidth: 280,
        p: 1,
      }}
    >
      {keys.map((key) => {
        return (
          <MuiIconButton
            key={key}
            size="small"
            sx={{ fontSize: '1.35rem' }}
            onClick={() => {
              onSelect(key);
            }}
          >
            {emotions[key].staticSource}
          </MuiIconButton>
        );
      })}
    </Box>
  );
};

export default EmojiPickerFull;

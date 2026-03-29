/* eslint-disable react/boolean-prop-naming -- showRightSlot matches features API */
import TextField from '@mui/material/TextField';

import type { FC, ReactNode } from 'react';

export type TFilterFieldBaseProps = {
  placeholder: string;
  rightSlot?: ReactNode;
  showRightSlot?: boolean;
  testid?: string;
  value: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
};

const FilterFieldBase: FC<TFilterFieldBaseProps> = ({
  placeholder,
  rightSlot,
  showRightSlot,
  testid,
  value,
  onBlur,
  onChange,
}) => {
  const endAdornment = showRightSlot === true && rightSlot !== undefined ? rightSlot : undefined;

  return (
    <TextField
      fullWidth
      placeholder={placeholder}
      slotProps={{
        htmlInput: {
          'data-testid': testid,
        },
        input: {
          endAdornment,
        },
      }}
      value={value}
      onBlur={onBlur}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  );
};

export default FilterFieldBase;

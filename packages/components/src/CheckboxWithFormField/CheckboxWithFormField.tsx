/* eslint-disable react/boolean-prop-naming -- CheckboxWithFormField API mirrors features */
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import type { ChangeEvent, FC } from 'react';

export type TCheckboxWithFormFieldProps = {
  checked: boolean;
  disabled?: boolean;
  label: string;
  size?: 'compact';
  testid?: string;
  type?: 'reversed';
  onChange: (value: boolean) => void;
};

const CheckboxWithFormField: FC<TCheckboxWithFormFieldProps> = ({
  checked,
  disabled,
  label,
  size,
  testid,
  type,
  onChange,
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  const isReversed = type === 'reversed';
  const isCompact = size === 'compact';

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          data-testid={testid}
          disabled={disabled === true}
          size={isCompact ? 'small' : 'medium'}
          onChange={handleChange}
        />
      }
      disabled={disabled === true}
      label={label}
      labelPlacement={isReversed ? 'start' : 'end'}
      sx={
        isReversed
          ? {
              justifyContent: 'space-between',
              marginLeft: 0,
              width: '100%',
            }
          : undefined
      }
    />
  );
};

export default CheckboxWithFormField;

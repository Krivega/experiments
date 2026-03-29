/* eslint-disable react/boolean-prop-naming -- mirrors poll vote API */
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';

import type { ChangeEvent, FC } from 'react';

export type TRadioWithFormFieldProps = {
  checked: boolean;
  label: string;
  name: string;
  onChange: (value: boolean) => void;
};

const RadioWithFormField: FC<TRadioWithFormFieldProps> = ({ checked, label, name, onChange }) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onChange(true);
    }
  };

  return (
    <FormControlLabel
      control={<Radio checked={checked} name={name} value={label} onChange={handleChange} />}
      label={label}
    />
  );
};

export default RadioWithFormField;

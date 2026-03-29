/* eslint-disable react/boolean-prop-naming -- ToggleSwitch API mirrors features */
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import type { ChangeEvent, FC } from 'react';

export type TToggleSwitchProps = {
  checked: boolean;
  label: string;
  testid: string;
  onChange: (value: boolean) => void;
};

const ToggleSwitch: FC<TToggleSwitchProps> = ({ checked, label, testid, onChange }) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <FormControlLabel
      control={
        <span data-testid={testid}>
          <Switch checked={checked} onChange={handleChange} />
        </span>
      }
      label={label}
    />
  );
};

export default ToggleSwitch;

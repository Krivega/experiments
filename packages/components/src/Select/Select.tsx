import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MuiSelect from '@mui/material/Select';
import { useId } from 'react';

import type { FC, PropsWithChildren } from 'react';

export type TSelectProps = {
  label: string;
  testid: string;
  value: string;
  onChange: (value: string) => void;
};

const Select: FC<PropsWithChildren<TSelectProps>> = ({
  children,
  label,
  testid,
  value,
  onChange,
}) => {
  const labelId = useId();

  return (
    <FormControl fullWidth>
      <InputLabel id={labelId}>{label}</InputLabel>

      <MuiSelect
        inputProps={{ 'data-testid': testid }}
        label={label}
        labelId={labelId}
        value={value}
        onChange={(event) => {
          onChange(String(event.target.value));
        }}
      >
        {children}
      </MuiSelect>
    </FormControl>
  );
};

export default Select;

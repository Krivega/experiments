import Clear from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

import type { FC } from 'react';

export type TFilterFieldProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onClickClear: () => void;
};

const FilterField: FC<TFilterFieldProps> = ({ placeholder, value, onChange, onClickClear }) => {
  return (
    <TextField
      fullWidth
      InputProps={{
        endAdornment:
          value === '' ? undefined : (
            <InputAdornment position="end">
              <IconButton aria-label="clear" edge="end" size="small" onClick={onClickClear}>
                <Clear fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
      }}
      placeholder={placeholder}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  );
};

export default FilterField;

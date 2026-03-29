/* eslint-disable react/boolean-prop-naming -- TFieldProps mirrors ValidatedTextField / features API */
import TextField from '@mui/material/TextField';
import { useCallback, useState } from 'react';

import type { FC } from 'react';

export type TFieldProps = {
  button?: React.ReactNode;
  helperText?: string;
  invalid: boolean;
  label: string;
  maxLength?: number;
  persistentHelperText?: boolean;
  required?: boolean;
  showErrorsOnlyAfterBlur?: boolean;
  testid: string;
  type: 'text';
  validationMsgHelperText?: boolean;
  value: string;
  withoutLine?: boolean;
  onChange: (value: string) => void;
};

const Field: FC<TFieldProps> = ({
  button,
  helperText,
  invalid,
  label,
  maxLength,
  persistentHelperText: _persistentHelperText,
  required,
  showErrorsOnlyAfterBlur,
  testid,
  type,
  validationMsgHelperText: _validationMessageHelperText,
  value,
  withoutLine,
  onChange,
}) => {
  const [blurred, setBlurred] = useState(false);

  const handleBlur = useCallback(() => {
    setBlurred(true);
  }, []);

  const showErrorState = invalid && (showErrorsOnlyAfterBlur === true ? blurred : true);

  const hideHelperUntilBlur = showErrorsOnlyAfterBlur === true && invalid && !blurred;

  const displayHelperText =
    helperText !== undefined && helperText !== '' && !hideHelperUntilBlur ? helperText : undefined;

  return (
    <TextField
      fullWidth
      error={showErrorState}
      helperText={displayHelperText}
      label={label}
      required={required === true}
      slotProps={{
        htmlInput: {
          'data-testid': testid,
          maxLength,
        },
        input: {
          disableUnderline: withoutLine === true,
          endAdornment: button,
        },
      }}
      type={type}
      value={value}
      variant={withoutLine === true ? 'standard' : 'outlined'}
      onBlur={handleBlur}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    />
  );
};

export default Field;

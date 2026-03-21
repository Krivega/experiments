/* eslint-disable react/jsx-max-depth */
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React, { useState, useEffect } from 'react';

const ToggleButton = ({
  type,
  title,
  disabled,
  children,
  onActive,
  onInactive,
}: {
  type?: string;
  title: string;
  // eslint-disable-next-line react/boolean-prop-naming
  disabled: boolean;
  children: React.ReactNode;
  onActive: () => void;
  onInactive: () => void;
}) => {
  const [value, setValue] = useState<boolean>(false);

  useEffect(() => {
    if (value) {
      onActive();
    } else {
      onInactive();
    }
  }, [onActive, onInactive, value]);

  const id = `toggle-${title}`;

  const renderContainer = () => {
    if (!value) {
      return undefined;
    }

    let padding = '5px 20px';

    if (type === 'input') {
      padding = '0';
    }

    return (
      <Paper style={{ backgroundColor: '#fafafa', padding }} variant="outlined">
        {children}
      </Paper>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label htmlFor={id} style={{ cursor: disabled ? 'default' : 'pointer', flexGrow: '1' }}>
          <Typography color={disabled ? 'textSecondary' : 'textPrimary'} variant="h6">
            {title}
          </Typography>
        </label>

        <Checkbox
          checked={value}
          color="default"
          disabled={disabled}
          id={id}
          size="small"
          onChange={({ target: { checked } }) => {
            setValue(checked);
          }}
        />
      </div>

      {renderContainer()}
    </Box>
  );
};

export default ToggleButton;

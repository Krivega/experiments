import React, { useState, useEffect } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';

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
      return null;
    }

    let padding = '5px 20px';

    if (type === 'input') {
      padding = '0';
    }

    return (
      <Paper variant="outlined" style={{ backgroundColor: '#fafafa', padding }}>
        {children}
      </Paper>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label htmlFor={id} style={{ cursor: disabled ? 'default' : 'pointer', flexGrow: '1' }}>
          <Typography variant="h6" color={disabled ? 'textSecondary' : 'textPrimary'}>
            {title}
          </Typography>
        </label>
        <Checkbox
          size="small"
          id={id}
          onChange={({ target: { checked } }) => {
            setValue(checked);
          }}
          checked={value}
          disabled={disabled}
          color="default"
        />
      </div>
      {renderContainer()}
    </Box>
  );
};

export default ToggleButton;

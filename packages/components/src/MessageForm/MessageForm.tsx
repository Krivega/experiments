/* eslint-disable react/jsx-max-depth -- toolbar row */
import Send from '@mui/icons-material/Send';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';

import type { FC, PropsWithChildren } from 'react';

export type TMessageFormProps = {
  maxInputLength: number;
  placeholder: string;
  testidMessageInput: string;
  testidSendMessageIcon: string;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

const MessageForm: FC<PropsWithChildren<TMessageFormProps>> = ({
  children,
  maxInputLength,
  placeholder,
  testidMessageInput,
  testidSendMessageIcon,
  value,
  onChange,
  onSend,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
      <Box sx={{ alignItems: 'flex-end', display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          multiline
          inputProps={{
            'data-testid': testidMessageInput,
            maxLength: maxInputLength,
          }}
          maxRows={6}
          placeholder={placeholder}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />

        <IconButton color="primary" data-testid={testidSendMessageIcon} onClick={onSend}>
          <Send />
        </IconButton>
      </Box>

      {children}
    </Box>
  );
};

export default MessageForm;

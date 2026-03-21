import { Close } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import React from 'react';

const vertical = 'top';

const horizontal = 'center';

type TProps = {
  // eslint-disable-next-line react/boolean-prop-naming
  open: boolean;
  message: string;
  autoHideDuration: number | null;
  handleClose: () => void;
};

const SnackbarTop: React.FC<TProps> = ({ open, handleClose, message, autoHideDuration }) => {
  const action = (
    <IconButton aria-label="close" color="inherit" size="small" onClick={handleClose}>
      <Close fontSize="small" />
    </IconButton>
  );

  return (
    <Snackbar
      action={action}
      anchorOrigin={{ vertical, horizontal }}
      autoHideDuration={autoHideDuration}
      message={message}
      open={open}
      onClose={handleClose}
    />
  );
};

export default SnackbarTop;

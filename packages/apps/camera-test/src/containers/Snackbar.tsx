import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';

const vertical = 'top';
const horizontal = 'center';

type TProps = {
  open: boolean;
  message: string;
  autoHideDuration: number | null;
  handleClose: () => void;
};

const SnackbarTop: React.FC<TProps> = ({ open, handleClose, message, autoHideDuration }) => {
  const action = (
    <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
      <Close fontSize="small" />
    </IconButton>
  );

  return (
    <Snackbar
      open={open}
      message={message}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical, horizontal }}
      action={action}
    />
  );
};

export default SnackbarTop;

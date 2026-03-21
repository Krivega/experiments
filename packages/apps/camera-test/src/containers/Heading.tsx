import Typography from '@mui/material/Typography';
import React from 'react';

type TProps = { children: React.ReactNode };

const Heading: React.FC<TProps> = ({ children }) => {
  return <Typography variant="h5">{children}</Typography>;
};

export default Heading;

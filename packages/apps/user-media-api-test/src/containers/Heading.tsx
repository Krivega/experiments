import React from 'react';
import Typography from '@material-ui/core/Typography';

type TProps = { children: React.ReactNode };

const Heading: React.FC<TProps> = ({ children }) => {
  return <Typography variant="h5">{children}</Typography>;
};

export default Heading;

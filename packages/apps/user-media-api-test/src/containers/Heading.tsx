import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

const Heading = ({ children }) => {
  return (
    <Container>
      <Typography variant="h5">{children}</Typography>
    </Container>
  );
};

export default Heading;

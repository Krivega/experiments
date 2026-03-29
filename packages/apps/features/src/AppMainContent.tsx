import Container from '@mui/material/Container';
import { Outlet } from 'react-router-dom';

export const AppMainContent = () => {
  return (
    <Container maxWidth="md">
      <Outlet />
    </Container>
  );
};

import { Heading, LayoutContent, Text } from '@experiments/components';
import Box from '@mui/material/Box';

const HomePage = () => {
  return (
    <LayoutContent column>
      <Heading type="body1">Главная</Heading>

      <Box sx={{ mt: 2 }}>
        <Text>Демо-приложение пакета features: навигация и разделы.</Text>
      </Box>
    </LayoutContent>
  );
};

export default HomePage;

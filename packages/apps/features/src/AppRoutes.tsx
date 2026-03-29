import { Navigate, Route, Routes } from 'react-router-dom';

import App from './App';
import ChatPage from './pages/Chat';
import ComponentsPage from './pages/ComponentsPage';
import HomePage from './pages/HomePage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<App />} path="/">
        <Route index element={<HomePage />} />

        <Route element={<ComponentsPage />} path="components" />

        <Route element={<ChatPage />} path="chat" />
      </Route>

      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
};

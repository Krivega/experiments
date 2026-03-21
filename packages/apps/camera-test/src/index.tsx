import { ThemeProvider } from '@mui/material/styles';
import { createRoot } from 'react-dom/client';

import App from './App';
import { appTheme } from './theme';
// import reportWebVitals from './reportWebVitals';

const container = document.querySelector('#root');

if (!container) {
  throw new Error('Container not found');
}

const root = createRoot(container); // createRoot(container!) if you use TypeScript

root.render(
  <ThemeProvider theme={appTheme}>
    <App />
  </ThemeProvider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

import { createRoot } from 'react-dom/client';

import { Root } from './Root';

const rootElement = document.querySelector('#root');

if (rootElement === null) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(<Root />);

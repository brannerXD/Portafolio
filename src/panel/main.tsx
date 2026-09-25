import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { PanelApp } from './PanelApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PanelApp />
  </StrictMode>,
);

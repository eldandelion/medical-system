import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Material Web Components defensively
const registerMaterialWeb = async () => {
  if (!customElements.get('md-chip-set')) {
    await import('@material/web/chips/chip-set.js');
  }
  if (!customElements.get('md-filter-chip')) {
    await import('@material/web/chips/filter-chip.js');
  }
  if (!customElements.get('md-assist-chip')) {
    await import('@material/web/chips/assist-chip.js');
  }
  if (!customElements.get('md-icon')) {
    await import('@material/web/icon/icon.js');
  }
  if (!customElements.get('md-icon-button')) {
    await import('@material/web/iconbutton/icon-button.js');
  }
  if (!customElements.get('md-menu')) {
    await import('@material/web/menu/menu.js');
  }
  if (!customElements.get('md-menu-item')) {
    await import('@material/web/menu/menu-item.js');
  }
  if (!customElements.get('md-filled-button')) {
    await import('@material/web/button/filled-button.js');
  }
  if (!customElements.get('md-outlined-button')) {
    await import('@material/web/button/outlined-button.js');
  }
};

registerMaterialWeb();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

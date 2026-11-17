import {createRoot} from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker immediately for Android installability and updates
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<App />);

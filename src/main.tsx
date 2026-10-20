import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Clean up any stale dev-sw.js service workers that could block Shared Client Link or Google Drive Sync
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      if (
        registration.active?.scriptURL.includes('dev-sw') ||
        registration.installing?.scriptURL.includes('dev-sw') ||
        registration.waiting?.scriptURL.includes('dev-sw')
      ) {
        registration.unregister();
      }
    }
  }).catch(() => {});
}

createRoot(document.getElementById('root')!).render(<App />);

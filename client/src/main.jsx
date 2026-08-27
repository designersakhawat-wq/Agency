import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// One-time self-repair: purge any legacy bloated or corrupted local storage keys
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const keysToClean = [
      'sakhawat_media_library',
      'sakhawat_cached_admin_stats',
    ];
    for (const k of keysToClean) {
      const val = window.localStorage.getItem(k);
      if (val && (val.length > 200000 || val.includes('/placeholder-cleaned.png'))) {
        window.localStorage.removeItem(k);
      }
    }
    const settings = window.localStorage.getItem('sakhawat_cached_settings');
    if (settings && settings.includes('/placeholder-cleaned.png')) {
      window.localStorage.removeItem('sakhawat_cached_settings');
    }
  } catch (e) {}
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

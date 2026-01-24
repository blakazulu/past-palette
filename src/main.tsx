import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import App from './App';
import './i18n'; // Initialize i18next
import './index.css';

const VERSION_STORAGE_KEY = 'past-palette-app-version';

async function checkVersionAndClearCacheIfNeeded(): Promise<boolean> {
  try {
    // Fetch version.json with cache-busting query param
    const response = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn('[Version Check] Failed to fetch version.json:', response.status);
      return false;
    }

    const { version: serverVersion } = await response.json();
    const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);

    console.log(`[Version Check] Server: ${serverVersion}, Local: ${storedVersion ?? 'none'}`);

    // First visit - just store version, don't reload
    if (!storedVersion) {
      localStorage.setItem(VERSION_STORAGE_KEY, serverVersion);
      return false;
    }

    // Versions match - no action needed
    if (storedVersion === serverVersion) {
      return false;
    }

    console.log('[Version Check] Version mismatch - clearing caches and reloading...');

    // Clear all Cache API caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log(`[Version Check] Cleared ${cacheNames.length} cache(s)`);
    }

    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      console.log(`[Version Check] Unregistered ${registrations.length} service worker(s)`);
    }

    // Store new version before reload
    localStorage.setItem(VERSION_STORAGE_KEY, serverVersion);

    // Reload page to fetch fresh assets
    window.location.reload();
    return true;
  } catch (err) {
    console.error('[Version Check] Error:', err);
    return false;
  }
}

async function init() {
  // Check version first - if reload happens, execution stops here
  const isReloading = await checkVersionAndClearCacheIfNeeded();
  if (isReloading) {
    return; // Stop execution, page is reloading
  }

  // Render app
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  );
}

init();

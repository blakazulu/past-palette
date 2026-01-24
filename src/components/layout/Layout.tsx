import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { InstallPrompt, OfflineIndicator, UploadProgress } from '@/components/ui';
import { useAppStore } from '@/stores/appStore';

export function Layout() {
  const setOnlineStatus = useAppStore((s) => s.setOnlineStatus);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial status
    setOnlineStatus(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  return (
    <div className="min-h-screen text-obsidian-100 flex flex-col">
      {/* Global background image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/bg.webp)' }}
      />
      {/* Dark overlay for better text readability */}
      <div className="fixed inset-0 z-0 bg-obsidian-950/40" />

      <OfflineIndicator />
      <Header />
      <main className="relative z-10 flex-1 pb-24">
        <div className="max-w-4xl mx-auto">
          <Outlet />
        </div>
      </main>
      <BottomNav />
      <InstallPrompt />
      <UploadProgress />
    </div>
  );
}

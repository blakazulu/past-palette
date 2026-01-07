import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { InstallPrompt, OfflineIndicator } from '@/components/ui';
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
    <div className="min-h-screen bg-ancient-900 text-ancient-50 flex flex-col">
      <OfflineIndicator />
      <Header />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNav />
      <InstallPrompt />
    </div>
  );
}

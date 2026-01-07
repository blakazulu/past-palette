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
    <div className="min-h-screen bg-obsidian-950 text-obsidian-100 flex flex-col texture-stone">
      {/* Global ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Top corner glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-gold-500/3 to-transparent" />
        {/* Bottom corner glow */}
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-lapis-700/5 to-transparent" />
      </div>

      <OfflineIndicator />
      <Header />
      <main className="relative z-10 flex-1 pb-24">
        <Outlet />
      </main>
      <BottomNav />
      <InstallPrompt />
    </div>
  );
}

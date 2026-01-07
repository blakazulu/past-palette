import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores/appStore';
import { Layout } from '@/components/layout';
import { ErrorBoundary } from '@/components/ui';
import {
  HomePage,
  CapturePage,
  GalleryPage,
  ArtifactDetailPage,
  SettingsPage,
} from '@/pages';

function App() {
  const { i18n } = useTranslation();
  const { language } = useSettingsStore();

  // Sync language with settings store on mount
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="capture" element={<CapturePage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="artifact/:id" element={<ArtifactDetailPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

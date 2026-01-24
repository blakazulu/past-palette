import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchGalleryArtifacts } from '@/lib/firebase/galleryService';
import type { GalleryArtifact } from '@/types/gallery';

export function PublicGalleryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [artifacts, setArtifacts] = useState<GalleryArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArtifacts() {
      try {
        setLoading(true);
        const data = await fetchGalleryArtifacts(30);
        setArtifacts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load gallery');
      } finally {
        setLoading(false);
      }
    }

    loadArtifacts();
  }, []);

  const handleEnterTour = () => {
    navigate('/gallery-tour');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gold-600 hover:bg-gold-500 text-obsidian-950 rounded-lg transition-colors"
        >
          {t('common.tryAgain')}
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 pb-24">
      {/* Page Header */}
      <div className="mb-8 opacity-0-initial animate-reveal-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500/20 to-gold-600/10 flex items-center justify-center">
            <GalleryIcon className="w-4 h-4 text-gold-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl text-obsidian-50">
            {t('publicGallery.title')}
          </h1>
        </div>
        <p className="text-obsidian-300 text-base ml-11">
          {t('publicGallery.subtitle', { count: artifacts.length })}
        </p>
      </div>

      {/* Enter 3D Tour Button */}
      <div className="flex justify-center mb-8 opacity-0-initial animate-reveal-up delay-100">
        <button
          type="button"
          onClick={handleEnterTour}
          disabled={artifacts.length === 0}
          className="px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 disabled:from-obsidian-700 disabled:to-obsidian-600 disabled:text-obsidian-400 text-obsidian-950 font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-gold-600/20"
        >
          <CubeIcon className="w-5 h-5" />
          {t('publicGallery.enterTour')}
        </button>
      </div>

      {/* Grid */}
      {artifacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 opacity-0-initial animate-reveal-fade delay-200">
          <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center mb-4">
            <GalleryIcon className="w-8 h-8 text-obsidian-400" />
          </div>
          <p className="text-obsidian-400 font-display tracking-wide">
            {t('publicGallery.empty')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 opacity-0-initial animate-reveal-up delay-200">
          {artifacts.map((artifact) => (
            <div
              key={artifact.id}
              className="aspect-square rounded-xl overflow-hidden bg-obsidian-800 relative group cursor-pointer"
            >
              <img
                src={artifact.thumbnailUrl}
                alt={artifact.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-obsidian-50 font-medium text-sm truncate">
                    {artifact.name}
                  </p>
                  <p className="text-obsidian-300 text-xs">
                    {artifact.variants.length} {t('publicGallery.variants')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}

function CubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
      />
    </svg>
  );
}

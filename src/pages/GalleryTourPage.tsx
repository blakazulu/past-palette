import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { useProgress, Html } from '@react-three/drei';
import { useTranslation } from 'react-i18next';
import {
  GalleryRoom,
  ArtworkFrame,
  FirstPersonControls,
  TouchControls,
  ArtworkInfoOverlay,
} from '@/components/gallery-tour';
import { fetchGalleryArtifacts } from '@/lib/firebase/galleryService';
import type { GalleryArtifact } from '@/types/gallery';

// Frame positions around the room walls (21 total - no south wall/behind player)
const FRAME_POSITIONS: Array<{
  position: [number, number, number];
  rotation: [number, number, number];
}> = [
  // North wall (9 frames) - facing the entrance
  ...Array.from({ length: 9 }, (_, i) => ({
    position: [-12 + i * 3, 2.2, -13.8] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
  })),
  // West wall (6 frames)
  ...Array.from({ length: 6 }, (_, i) => ({
    position: [-15.8, 2.2, -10 + i * 4] as [number, number, number],
    rotation: [0, Math.PI / 2, 0] as [number, number, number],
  })),
  // East wall (6 frames)
  ...Array.from({ length: 6 }, (_, i) => ({
    position: [15.8, 2.2, -10 + i * 4] as [number, number, number],
    rotation: [0, -Math.PI / 2, 0] as [number, number, number],
  })),
];

/**
 * Fisher-Yates shuffle for unbiased randomization
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Loading indicator shown inside the 3D canvas while resources load
 */
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold-500" />
        <p className="text-obsidian-200 text-sm font-medium">
          {progress.toFixed(0)}%
        </p>
      </div>
    </Html>
  );
}

export function GalleryTourPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [artifacts, setArtifacts] = useState<GalleryArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nearbyArtifact, setNearbyArtifact] = useState<GalleryArtifact | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  // Track variant index per artifact for when user switches variants
  const [artifactVariantMap, setArtifactVariantMap] = useState<Record<string, number>>({});

  const isMobile = useMemo(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent), []);

  // Check WebGL support
  const hasWebGL = useMemo(() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    async function loadArtifacts() {
      try {
        setError(null);
        const data = await fetchGalleryArtifacts(21);
        // Shuffle for discovery using Fisher-Yates
        const shuffled = shuffleArray(data);
        setArtifacts(shuffled);
      } catch (err) {
        console.error('Failed to load artifacts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load gallery');
      } finally {
        setLoading(false);
      }
    }

    loadArtifacts();
  }, []);

  const handleFrameClick = useCallback((artifact: GalleryArtifact) => {
    setNearbyArtifact(artifact);
    // Get the current variant index for this artifact, or default to 0
    setSelectedVariantIndex(artifactVariantMap[artifact.id] ?? 0);
  }, [artifactVariantMap]);

  const handleVariantChange = useCallback((index: number) => {
    setSelectedVariantIndex(index);
    if (nearbyArtifact) {
      setArtifactVariantMap((prev) => ({
        ...prev,
        [nearbyArtifact.id]: index,
      }));
    }
  }, [nearbyArtifact]);

  const handleExit = () => {
    document.exitPointerLock();
    navigate('/public-gallery');
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Re-trigger the effect by forcing a re-render
    setArtifacts([]);
  };

  // Fallback for no WebGL
  if (!hasWebGL) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-obsidian-950">
        <p className="text-obsidian-300 mb-4">
          {t('galleryTour.noWebGL', 'Your browser does not support 3D graphics.')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/public-gallery')}
          className="px-4 py-2 bg-gold-600 hover:bg-gold-500 text-obsidian-950 rounded-lg"
        >
          {t('galleryTour.viewGrid', 'View Grid Gallery')}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-obsidian-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500" />
        <p className="text-obsidian-300 mt-4 text-sm">
          {t('galleryTour.loadingArtworks', 'Loading artworks...')}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-obsidian-950">
        <p className="text-red-400 mb-4">{error}</p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleRetry}
            className="px-4 py-2 bg-gold-600 hover:bg-gold-500 text-obsidian-950 rounded-lg"
          >
            {t('common.tryAgain', 'Try Again')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/public-gallery')}
            className="px-4 py-2 bg-obsidian-700 hover:bg-obsidian-600 text-obsidian-200 rounded-lg"
          >
            {t('galleryTour.viewGrid', 'View Grid Gallery')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1.7, 12], fov: 75 }}
        shadows={!isMobile}
        dpr={isMobile ? [1, 1] : [1, 2]}
        gl={{ antialias: !isMobile }}
      >
        <Suspense fallback={<Loader />}>
          <GalleryRoom />

          {/* Render all frame positions - with or without artifacts */}
          {FRAME_POSITIONS.map((framePos, index) => {
            const artifact = artifacts[index] || null;
            const isSelected = artifact && nearbyArtifact?.id === artifact.id;

            return (
              <ArtworkFrame
                key={`frame-${index}`}
                artifact={artifact}
                position={framePos.position}
                rotation={framePos.rotation}
                isNearby={!!isSelected}
                variantIndex={isSelected ? selectedVariantIndex : (artifact ? (artifactVariantMap[artifact.id] ?? 0) : 0)}
                onClick={artifact ? () => handleFrameClick(artifact) : undefined}
              />
            );
          })}

          {isMobile ? (
            <TouchControls enabled={!showInstructions} />
          ) : (
            <FirstPersonControls enabled={!showInstructions} />
          )}
        </Suspense>
      </Canvas>

      {/* Instructions overlay */}
      {showInstructions && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-obsidian-900 rounded-xl p-6 max-w-md text-center border border-obsidian-700">
            <h2 className="text-xl font-bold text-obsidian-100 mb-4">
              {t('galleryTour.welcome', 'Welcome to the Gallery')}
            </h2>
            <div className="text-obsidian-300 text-sm space-y-2 mb-6">
              {isMobile ? (
                <>
                  <p>{t('galleryTour.mobileMove', 'Use left side to move')}</p>
                  <p>{t('galleryTour.mobileLook', 'Drag right side to look around')}</p>
                  <p>{t('galleryTour.mobileTap', 'Tap artwork to see details')}</p>
                </>
              ) : (
                <>
                  <p>{t('galleryTour.desktopMove', 'WASD or Arrow keys to move')}</p>
                  <p>{t('galleryTour.desktopLook', 'Mouse to look around')}</p>
                  <p>{t('galleryTour.desktopSprint', 'Hold Shift to sprint')}</p>
                  <p>{t('galleryTour.desktopClick', 'Click to enable controls')}</p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowInstructions(false)}
              className="px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-obsidian-950 font-semibold rounded-xl shadow-lg shadow-gold-600/20"
            >
              {t('galleryTour.enter', 'Enter Gallery')}
            </button>
          </div>
        </div>
      )}

      {/* Artwork info overlay */}
      {!showInstructions && (
        <ArtworkInfoOverlay
          artifact={nearbyArtifact}
          currentVariantIndex={selectedVariantIndex}
          onChangeVariant={handleVariantChange}
          onClose={() => setNearbyArtifact(null)}
        />
      )}

      {/* Exit button */}
      {!showInstructions && (
        <button
          type="button"
          onClick={handleExit}
          className="absolute top-4 right-4 px-4 py-2 bg-obsidian-800/80 hover:bg-obsidian-700 text-obsidian-200 rounded-lg backdrop-blur-sm border border-obsidian-600"
        >
          {t('common.close')}
        </button>
      )}

      {/* Artifact counter */}
      {!showInstructions && (
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-obsidian-800/80 text-obsidian-300 rounded-lg backdrop-blur-sm text-sm border border-obsidian-600">
          {artifacts.length} {t('galleryTour.artworks', 'artworks')}
        </div>
      )}
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import type { GalleryArtifact } from '@/types/gallery';

interface ArtworkInfoOverlayProps {
  artifact: GalleryArtifact | null;
  currentVariantIndex: number;
  onChangeVariant: (index: number) => void;
  onClose: () => void;
}

export function ArtworkInfoOverlay({
  artifact,
  currentVariantIndex,
  onChangeVariant,
  onClose,
}: ArtworkInfoOverlayProps) {
  const { t } = useTranslation();

  if (!artifact) return null;

  const currentVariant = artifact.variants[currentVariantIndex];

  return (
    <div className="absolute bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-obsidian-900/95 backdrop-blur-sm rounded-xl p-4 border border-obsidian-700">
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 text-obsidian-400 hover:text-obsidian-200"
      >
        ✕
      </button>

      {/* Artifact name */}
      <h3 className="text-lg font-semibold text-obsidian-100 mb-1 pr-6">
        {artifact.name}
      </h3>

      {artifact.siteName && (
        <p className="text-sm text-obsidian-400 mb-3">{artifact.siteName}</p>
      )}

      {/* Current scheme */}
      <div className="mb-3">
        <span className="text-xs text-obsidian-500 uppercase tracking-wide">
          {t('gallery.colorScheme', 'Color Scheme')}
        </span>
        <p className="text-obsidian-200 capitalize">
          {currentVariant?.colorScheme || 'Unknown'}
        </p>
      </div>

      {/* Variant thumbnails */}
      {artifact.variants.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {artifact.variants.map((variant, index) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => onChangeVariant(index)}
              className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentVariantIndex
                  ? 'border-gold-500'
                  : 'border-transparent hover:border-obsidian-600'
              }`}
            >
              <img
                src={variant.imageUrl}
                alt={variant.colorScheme}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import type { ColorVariant, ArtifactImage, ColorScheme } from '@/types/artifact';
import { useColorize } from '@/hooks/useColorize';
import {
  ColorVariantGallery,
  ColorizationCard,
  VariantDetailView,
} from '@/components/colorization';
import { downloadVariant, shareVariant } from '@/lib/utils/export';

interface ColorsTabProps {
  artifactId: string;
  artifactName?: string;
  variants: ColorVariant[];
  variantsLoaded: boolean;
  primaryImage: ArtifactImage | undefined;
  onDeleteVariant: (variantId: string) => void;
}

export function ColorsTab({
  artifactId,
  artifactName,
  variants,
  variantsLoaded,
  primaryImage,
  onDeleteVariant,
}: ColorsTabProps) {
  const [selectedVariant, setSelectedVariant] = useState<ColorVariant | null>(null);
  const [showColorizer, setShowColorizer] = useState<boolean | null>(null);

  const { colorize, step, progress, error, variant: newVariant, reset } = useColorize();

  // Initialize showColorizer after variants are loaded
  useEffect(() => {
    if (variantsLoaded && showColorizer === null) {
      setShowColorizer(variants.length === 0);
    }
  }, [variantsLoaded, variants.length, showColorizer]);

  // Auto-navigate to the new variant when colorization completes
  useEffect(() => {
    if (step === 'complete' && newVariant) {
      setSelectedVariant(newVariant);
      setShowColorizer(false);
    }
  }, [step, newVariant]);

  const handleColorize = async (
    scheme: ColorScheme,
    customPrompt?: string,
    includeRestoration?: boolean
  ) => {
    if (!primaryImage) return;

    await colorize(
      artifactId,
      primaryImage.blob,
      scheme,
      customPrompt,
      includeRestoration
    );
  };

  const handleSelectVariant = (variant: ColorVariant) => {
    setSelectedVariant(variant);
    setShowColorizer(false);
  };

  const handleCloseDetail = () => {
    setSelectedVariant(null);
  };

  const handleDownload = () => {
    if (selectedVariant) {
      downloadVariant(selectedVariant, artifactName);
    }
  };

  const handleShare = async () => {
    if (selectedVariant) {
      await shareVariant(selectedVariant, artifactName);
    }
  };

  const handleDeleteSelectedVariant = () => {
    if (selectedVariant) {
      onDeleteVariant(selectedVariant.id);
      setSelectedVariant(null);
    }
  };

  const handleAddVariant = () => {
    setSelectedVariant(null);
    setShowColorizer(true);
    reset();
  };

  // Show variant detail view
  if (selectedVariant && primaryImage) {
    return (
      <VariantDetailView
        variant={selectedVariant}
        originalImage={primaryImage.blob}
        onClose={handleCloseDetail}
        onDownload={handleDownload}
        onShare={handleShare}
        onDelete={handleDeleteSelectedVariant}
      />
    );
  }

  // Still loading variants
  if (showColorizer === null) {
    return null;
  }

  // Show colorizer
  if (showColorizer) {
    return (
      <div className="space-y-6">
        <ColorizationCard
          onColorize={handleColorize}
          step={step}
          progress={progress}
          error={error ?? undefined}
          disabled={!primaryImage}
        />

        {variants.length > 0 && (
          <button
            type="button"
            onClick={() => setShowColorizer(false)}
            className="w-full py-2 text-base text-ancient-400 hover:text-ancient-200 transition-colors"
          >
            &larr; Back to variants
          </button>
        )}
      </div>
    );
  }

  // Show variant gallery
  return (
    <ColorVariantGallery
      variants={variants}
      selectedVariantId={selectedVariant?.id}
      onSelectVariant={handleSelectVariant}
      onDeleteVariant={onDeleteVariant}
      onAddVariant={handleAddVariant}
    />
  );
}

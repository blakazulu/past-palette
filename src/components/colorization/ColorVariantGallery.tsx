import { useTranslation } from 'react-i18next';
import type { ColorVariant } from '@/types/artifact';
import { ColorVariantCard } from './ColorVariantCard';

interface ColorVariantGalleryProps {
  variants: ColorVariant[];
  selectedVariantId?: string;
  onSelectVariant: (variant: ColorVariant) => void;
  onDeleteVariant?: (variantId: string) => void;
  onAddVariant?: () => void;
}

export function ColorVariantGallery({
  variants,
  selectedVariantId,
  onSelectVariant,
  onDeleteVariant,
  onAddVariant,
}: ColorVariantGalleryProps) {
  const { t } = useTranslation();

  if (variants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 rounded-full bg-ancient-800 border border-ancient-700 flex items-center justify-center mb-4">
          <PaletteIcon className="w-8 h-8 text-ancient-500" />
        </div>
        <p className="text-ancient-300 mb-2">{t('artifact.noVariants')}</p>
        <p className="text-sm text-ancient-500 text-center mb-6 max-w-xs">
          {t('artifact.noVariantsHint')}
        </p>
        {onAddVariant && (
          <button
            type="button"
            onClick={onAddVariant}
            className="px-6 py-3 rounded-xl bg-gold-500 text-ancient-900 font-semibold hover:bg-gold-400 transition-colors"
          >
            {t('colorization.colorize')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-ancient-300">
          {t('artifact.variants')} ({variants.length})
        </h3>
        {onAddVariant && (
          <button
            type="button"
            onClick={onAddVariant}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-ancient-800 text-ancient-200 hover:bg-ancient-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            {t('colorization.addVariant')}
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {variants.map((variant) => (
          <ColorVariantCard
            key={variant.id}
            variant={variant}
            onClick={() => onSelectVariant(variant)}
            onDelete={onDeleteVariant ? () => onDeleteVariant(variant.id) : undefined}
            isSelected={variant.id === selectedVariantId}
          />
        ))}
      </div>
    </div>
  );
}

function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"
      />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

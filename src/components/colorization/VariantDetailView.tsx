import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColorVariant } from '@/types/artifact';
import { BeforeAfterSlider } from './BeforeAfterSlider';

type ViewMode = 'compare' | 'colorized' | 'original';

interface VariantDetailViewProps {
  variant: ColorVariant;
  originalImage: Blob;
  onClose?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
}

export function VariantDetailView({
  variant,
  originalImage,
  onClose,
  onDownload,
  onShare,
  onDelete,
}: VariantDetailViewProps) {
  const { t, i18n } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('compare');
  const [colorizedUrl, setColorizedUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  useEffect(() => {
    const cUrl = URL.createObjectURL(variant.blob);
    const oUrl = URL.createObjectURL(originalImage);
    setColorizedUrl(cUrl);
    setOriginalUrl(oUrl);
    return () => {
      URL.revokeObjectURL(cUrl);
      URL.revokeObjectURL(oUrl);
    };
  }, [variant.blob, originalImage]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  const getSchemeLabel = (scheme: string) => {
    const key = `colorSchemes.${scheme}`;
    const translated = t(key);
    return translated !== key ? translated : scheme;
  };

  return (
    <div className="bg-ancient-900 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-ancient-700">
        <div>
          <h3 className="text-lg font-semibold text-ancient-100">
            {getSchemeLabel(variant.colorScheme)}
          </h3>
          <p className="text-sm text-ancient-500">{formatDate(variant.createdAt)}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-ancient-800 transition-colors"
          >
            <CloseIcon className="w-5 h-5 text-ancient-400" />
          </button>
        )}
      </div>

      {/* View mode tabs */}
      <div className="flex border-b border-ancient-700">
        {(['compare', 'colorized', 'original'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setViewMode(mode)}
            className={`
              flex-1 px-4 py-3 text-base font-medium transition-colors
              ${
                viewMode === mode
                  ? 'text-gold-500 border-b-2 border-gold-500 bg-ancient-800/50'
                  : 'text-ancient-400 hover:text-ancient-200'
              }
            `}
          >
            {t(`artifact.${mode === 'compare' ? 'compare' : mode === 'colorized' ? 'colors' : 'original'}`)}
          </button>
        ))}
      </div>

      {/* Image display */}
      <div className="p-4">
        {viewMode === 'compare' ? (
          <BeforeAfterSlider
            beforeImage={originalImage}
            afterImage={variant.blob}
          />
        ) : (
          <div className="aspect-square rounded-xl overflow-hidden bg-ancient-800">
            {viewMode === 'colorized' && colorizedUrl && (
              <img
                src={colorizedUrl}
                alt={getSchemeLabel(variant.colorScheme)}
                className="w-full h-full object-cover"
              />
            )}
            {viewMode === 'original' && originalUrl && (
              <img
                src={originalUrl}
                alt={t('artifact.original')}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}
      </div>

      {/* Speculative notice */}
      <div className="px-4 pb-2">
        <p className="text-sm text-ancient-500 text-center">
          {t('artifact.speculativeNote')}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 p-4 pt-2">
        {onDownload && (
          <button
            type="button"
            onClick={onDownload}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gold-500 text-ancient-900 font-semibold hover:bg-gold-400 transition-colors"
          >
            <DownloadIcon className="w-5 h-5" />
            {t('artifact.download')}
          </button>
        )}
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="flex items-center justify-center p-3 rounded-xl bg-ancient-800 text-ancient-200 hover:bg-ancient-700 transition-colors"
          >
            <ShareIcon className="w-5 h-5" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center justify-center p-3 rounded-xl bg-ancient-800 text-red-400 hover:bg-ancient-700 transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

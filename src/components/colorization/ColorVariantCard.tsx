import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColorVariant } from '@/types/artifact';

interface ColorVariantCardProps {
  variant: ColorVariant;
  onClick?: () => void;
  onDelete?: () => void;
  isSelected?: boolean;
}

export function ColorVariantCard({
  variant,
  onClick,
  onDelete,
  isSelected = false,
}: ColorVariantCardProps) {
  const { t, i18n } = useTranslation();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(variant.blob);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [variant.blob]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(i18n.language, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getSchemeLabel = (scheme: string) => {
    const key = `colorSchemes.${scheme}`;
    const translated = t(key);
    return translated !== key ? translated : scheme;
  };

  return (
    <div
      className={`
        relative rounded-xl overflow-hidden cursor-pointer transition-all
        ${isSelected ? 'ring-2 ring-gold-500 ring-offset-2 ring-offset-ancient-900' : ''}
        group
      `}
      onClick={onClick}
    >
      {/* Image */}
      <div className="aspect-square bg-ancient-800">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={getSchemeLabel(variant.colorScheme)}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-ancient-900/90 via-transparent to-transparent" />

      {/* Color scheme badge */}
      <div className="absolute top-2 left-2">
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-ancient-900/80 text-ancient-100 backdrop-blur-sm">
          {getSchemeLabel(variant.colorScheme)}
        </span>
      </div>

      {/* Delete button */}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-ancient-900/80 text-ancient-400 hover:text-red-400 hover:bg-ancient-900 transition-colors opacity-0 group-hover:opacity-100"
          aria-label={t('gallery.delete')}
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-xs text-ancient-400">{formatDate(variant.createdAt)}</p>
      </div>

      {/* Selected checkmark */}
      {isSelected && (
        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-gold-500">
          <CheckIcon className="w-4 h-4 text-ancient-900" />
        </div>
      )}
    </div>
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

import { useTranslation } from 'react-i18next';
import type { ColorScheme } from '@/types/artifact';

interface ColorSchemeOption {
  id: ColorScheme;
  nameKey: string;
  descriptionKey: string;
  swatches: string[];
}

const COLOR_SCHEMES: ColorSchemeOption[] = [
  {
    id: 'egyptian',
    nameKey: 'colorSchemes.egyptian',
    descriptionKey: 'colorSchemes.egyptianDesc',
    swatches: ['#1E3F66', '#FFD700', '#40E0D0', '#228B22'],
  },
  {
    id: 'roman',
    nameKey: 'colorSchemes.roman',
    descriptionKey: 'colorSchemes.romanDesc',
    swatches: ['#C41E3A', '#1E4D8C', '#DAA520', '#CD853F'],
  },
  {
    id: 'greek',
    nameKey: 'colorSchemes.greek',
    descriptionKey: 'colorSchemes.greekDesc',
    swatches: ['#D2691E', '#1C1C1C', '#4169E1', '#FFFAF0'],
  },
  {
    id: 'mesopotamian',
    nameKey: 'colorSchemes.mesopotamian',
    descriptionKey: 'colorSchemes.mesopotamianDesc',
    swatches: ['#000080', '#B8860B', '#8B4513', '#1C1C1C'],
  },
  {
    id: 'weathered',
    nameKey: 'colorSchemes.weathered',
    descriptionKey: 'colorSchemes.weatheredDesc',
    swatches: ['#9B8B7A', '#7A6B5A', '#5A4B3A', '#8B7355'],
  },
  {
    id: 'original',
    nameKey: 'colorSchemes.original',
    descriptionKey: 'colorSchemes.originalDesc',
    swatches: ['#A0A0A0', '#808080', '#606060', '#404040'],
  },
  {
    id: 'custom',
    nameKey: 'colorSchemes.custom',
    descriptionKey: 'colorSchemes.customDesc',
    swatches: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
  },
];

interface ColorSchemeSelectorProps {
  selected: ColorScheme;
  onSelect: (scheme: ColorScheme) => void;
  disabled?: boolean;
}

export function ColorSchemeSelector({
  selected,
  onSelect,
  disabled = false,
}: ColorSchemeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-ancient-300">
        {t('colorization.selectScheme')}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {COLOR_SCHEMES.map((scheme) => (
          <button
            key={scheme.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(scheme.id)}
            className={`
              relative p-4 rounded-xl border-2 text-left transition-all
              ${
                selected === scheme.id
                  ? 'border-gold-500 bg-ancient-800/80'
                  : 'border-ancient-700 bg-ancient-800/40 hover:border-ancient-600'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* Selection indicator */}
            {selected === scheme.id && (
              <div className="absolute top-2 right-2">
                <CheckIcon className="w-5 h-5 text-gold-500" />
              </div>
            )}

            {/* Swatches */}
            <div className="flex gap-1 mb-3">
              {scheme.swatches.map((color, index) => (
                <div
                  key={index}
                  className="w-6 h-6 rounded-full border border-ancient-600"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Name and description */}
            <h3 className="text-sm font-semibold text-ancient-100">
              {t(scheme.nameKey)}
            </h3>
            <p className="text-xs text-ancient-400 mt-1">
              {t(scheme.descriptionKey)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export { COLOR_SCHEMES };

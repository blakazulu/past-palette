import { useTranslation } from 'react-i18next';
import type { ColorScheme } from '@/types/artifact';

interface ColorSchemeOption {
  id: ColorScheme;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  gradient: string;
  accentColor: string;
}

const COLOR_SCHEMES: ColorSchemeOption[] = [
  {
    id: 'mesopotamian',
    nameKey: 'colorSchemes.mesopotamian',
    descriptionKey: 'colorSchemes.mesopotamianDesc',
    icon: '𒀭',
    gradient: 'from-amber-800 via-yellow-700 to-amber-900',
    accentColor: '#B8860B',
  },
  {
    id: 'egyptian',
    nameKey: 'colorSchemes.egyptian',
    descriptionKey: 'colorSchemes.egyptianDesc',
    icon: '𓂀',
    gradient: 'from-blue-800 via-cyan-600 to-blue-900',
    accentColor: '#1E3F66',
  },
  {
    id: 'roman',
    nameKey: 'colorSchemes.roman',
    descriptionKey: 'colorSchemes.romanDesc',
    icon: '🏛',
    gradient: 'from-red-900 via-red-700 to-red-950',
    accentColor: '#8B2942',
  },
  {
    id: 'greek',
    nameKey: 'colorSchemes.greek',
    descriptionKey: 'colorSchemes.greekDesc',
    icon: '🏺',
    gradient: 'from-orange-800 via-amber-600 to-orange-900',
    accentColor: '#D2691E',
  },
  {
    id: 'original',
    nameKey: 'colorSchemes.original',
    descriptionKey: 'colorSchemes.originalDesc',
    icon: '🤖',
    gradient: 'from-violet-800 via-purple-600 to-violet-900',
    accentColor: '#7C3AED',
  },
  {
    id: 'custom',
    nameKey: 'colorSchemes.custom',
    descriptionKey: 'colorSchemes.customDesc',
    icon: '✨',
    gradient: 'from-emerald-800 via-teal-600 to-emerald-900',
    accentColor: '#14B8A6',
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
    <div className="space-y-4">
      <label className="block text-base font-medium text-gold-400/90 uppercase tracking-wider font-display">
        {t('colorization.selectScheme')}
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {COLOR_SCHEMES.map((scheme) => {
          const isSelected = selected === scheme.id;
          return (
            <button
              key={scheme.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(scheme.id)}
              className={`
                group relative overflow-hidden rounded-xl p-4 text-center
                transition-all duration-300 transform
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'}
                ${isSelected
                  ? 'ring-2 ring-gold-400 ring-offset-2 ring-offset-obsidian-900 shadow-lg shadow-gold-500/20'
                  : 'hover:ring-1 hover:ring-gold-500/30'
                }
              `}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${scheme.gradient} opacity-90`} />

              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-obsidian-950/30" />

              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 z-20">
                  <div className="w-5 h-5 rounded-full bg-gold-400 flex items-center justify-center">
                    <CheckIcon className="w-3 h-3 text-obsidian-950" />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                {/* Icon */}
                <span className="text-3xl sm:text-4xl drop-shadow-lg">{scheme.icon}</span>

                {/* Name */}
                <h3 className="text-base font-semibold text-white font-display uppercase tracking-wide drop-shadow-md">
                  {t(scheme.nameKey)}
                </h3>

                {/* Description - visible on larger screens */}
                <p className="hidden sm:block text-sm text-white/70 leading-tight line-clamp-2">
                  {t(scheme.descriptionKey)}
                </p>
              </div>

              {/* Bottom accent line */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
                style={{ backgroundColor: scheme.accentColor }}
              />
            </button>
          );
        })}
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
      strokeWidth={3}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

export { COLOR_SCHEMES };

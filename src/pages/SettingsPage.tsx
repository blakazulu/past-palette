import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores/appStore';
import type { ColorScheme } from '@/types/artifact';

const colorSchemeOptions: { id: ColorScheme; labelKey: string; color: string }[] = [
  { id: 'mesopotamian', labelKey: 'schemes.mesopotamian', color: '#B8860B' },
  { id: 'egyptian', labelKey: 'schemes.egyptian', color: '#1E3F66' },
  { id: 'roman', labelKey: 'schemes.roman', color: '#8B2942' },
  { id: 'greek', labelKey: 'schemes.greek', color: '#D2691E' },
  { id: 'original', labelKey: 'schemes.original', color: '#7C3AED' },
  { id: 'custom', labelKey: 'schemes.custom', color: '#14B8A6' },
];

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const {
    language,
    setLanguage,
    defaultColorScheme,
    setDefaultColorScheme,
    includeRestoration,
    setIncludeRestoration,
    hapticsEnabled,
    setHapticsEnabled,
  } = useSettingsStore();

  const handleLanguageChange = (newLang: 'en' | 'he') => {
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="px-4 py-6 sm:px-6 max-w-lg mx-auto">
      {/* Page Header */}
      <div className="mb-8 opacity-0-initial animate-reveal-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500/20 to-gold-600/10 flex items-center justify-center">
            <SettingsIcon className="w-4 h-4 text-gold-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl text-obsidian-50">
            {t('settings.title')}
          </h1>
        </div>
        <p className="text-obsidian-400 text-base ml-11">
          {t('settings.subtitle') || 'Customize your experience'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Language Section */}
        <SettingCard
          icon={<LanguageIcon className="w-5 h-5" />}
          title={t('settings.language')}
          delay={100}
        >
          <div className="flex gap-2">
            <LanguageButton
              label="English"
              isActive={language === 'en'}
              onClick={() => handleLanguageChange('en')}
            />
            <LanguageButton
              label="עברית"
              isActive={language === 'he'}
              onClick={() => handleLanguageChange('he')}
            />
          </div>
        </SettingCard>

        {/* Default Color Scheme */}
        <SettingCard
          icon={<PaletteIcon className="w-5 h-5" />}
          title={t('settings.defaultScheme')}
          description={t('settings.defaultSchemeDesc') || 'Applied to new colorizations'}
          delay={200}
        >
          <div className="grid grid-cols-3 gap-2 mt-3">
            {colorSchemeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setDefaultColorScheme(option.id)}
                className={`
                  relative p-3 rounded-xl border transition-all duration-300
                  ${defaultColorScheme === option.id
                    ? 'border-gold-500 bg-gold-500/10'
                    : 'border-obsidian-700 bg-obsidian-800/50 hover:border-obsidian-600'
                  }
                `}
              >
                <div
                  className="w-full aspect-square rounded-lg mb-2"
                  style={{ backgroundColor: option.color }}
                />
                <span className={`text-sm font-display tracking-wider ${
                  defaultColorScheme === option.id ? 'text-gold-400' : 'text-obsidian-400'
                }`}>
                  {t(option.labelKey)}
                </span>
                {defaultColorScheme === option.id && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gold-500" />
                )}
              </button>
            ))}
          </div>
        </SettingCard>

        {/* Toggle Settings */}
        <SettingCard
          icon={<SparklesIcon className="w-5 h-5" />}
          title={t('settings.features') || 'Features'}
          delay={300}
        >
          <div className="space-y-4">
            <ToggleRow
              label={t('settings.restoration')}
              description={t('settings.restorationDesc')}
              enabled={includeRestoration}
              onChange={setIncludeRestoration}
            />
            <div className="h-px bg-gradient-to-r from-transparent via-obsidian-700 to-transparent" />
            <ToggleRow
              label={t('settings.haptics')}
              description={t('settings.hapticsDesc')}
              enabled={hapticsEnabled}
              onChange={setHapticsEnabled}
            />
          </div>
        </SettingCard>

        {/* About Section */}
        <SettingCard
          icon={<InfoIcon className="w-5 h-5" />}
          title={t('settings.about')}
          delay={400}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-obsidian-300 font-display tracking-wide">PastPalette</p>
              <p className="text-sm text-obsidian-500">{t('settings.version')}: 0.1.0</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-lapis-500/10 border border-lapis-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-lapis-400 font-display tracking-wider">BETA</span>
            </div>
          </div>
        </SettingCard>
      </div>

      {/* Footer decoration */}
      <div className="mt-12 flex items-center justify-center gap-3 opacity-0-initial animate-reveal-fade delay-500">
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-gold-600/30 to-transparent" />
        <AnkhIcon className="w-4 h-4 text-gold-500/30" />
        <div className="w-12 h-px bg-gradient-to-l from-transparent via-gold-600/30 to-transparent" />
      </div>
    </div>
  );
}

// Setting Card Container
function SettingCard({
  icon,
  title,
  description,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className="glass-panel rounded-xl p-5 opacity-0-initial animate-reveal-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-obsidian-800/80 flex items-center justify-center text-gold-500/70">
          {icon}
        </div>
        <div>
          <h3 className="font-display text-base tracking-wider uppercase text-obsidian-100">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-obsidian-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// Language Button
function LanguageButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-5 py-2.5 rounded-lg font-display text-sm tracking-wider transition-all duration-300
        ${isActive
          ? 'text-obsidian-950'
          : 'text-obsidian-400 hover:text-obsidian-200 bg-obsidian-800/50 hover:bg-obsidian-800'
        }
      `}
    >
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-gold-500 to-gold-400 rounded-lg" />
      )}
      <span className="relative">{label}</span>
    </button>
  );
}

// Toggle Row
function ToggleRow({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-base text-obsidian-200">{label}</p>
        {description && (
          <p className="text-sm text-obsidian-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`toggle-ancient ${enabled ? 'active' : ''}`}
      >
        <span className="toggle-knob" />
      </button>
    </div>
  );
}

// Icons
function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LanguageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
    </svg>
  );
}

function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
}

function AnkhIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c-2.2 0-4 1.8-4 4 0 1.5.8 2.8 2 3.5V11H7v2h3v9h4v-9h3v-2h-3V9.5c1.2-.7 2-2 2-3.5 0-2.2-1.8-4-4-4zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
    </svg>
  );
}

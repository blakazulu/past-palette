import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores/appStore';
import type { ColorScheme } from '@/types/artifact';

const colorSchemeOptions: { id: ColorScheme; labelKey: string }[] = [
  { id: 'original', labelKey: 'schemes.original' },
  { id: 'egyptian', labelKey: 'schemes.egyptian' },
  { id: 'roman', labelKey: 'schemes.roman' },
  { id: 'greek', labelKey: 'schemes.greek' },
  { id: 'mesopotamian', labelKey: 'schemes.mesopotamian' },
  { id: 'weathered', labelKey: 'schemes.weathered' },
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
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-ancient-50 mb-6">{t('settings.title')}</h1>

      <div className="space-y-6">
        {/* Language */}
        <SettingSection title={t('settings.language')}>
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
        </SettingSection>

        {/* Default Color Scheme */}
        <SettingSection title={t('settings.defaultScheme')}>
          <select
            value={defaultColorScheme}
            onChange={(e) => setDefaultColorScheme(e.target.value as ColorScheme)}
            className="w-full px-4 py-3 rounded-lg bg-ancient-800 border border-ancient-700 text-ancient-100 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
          >
            {colorSchemeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </SettingSection>

        {/* Include Restoration */}
        <SettingSection
          title={t('settings.restoration')}
          description={t('settings.restorationDesc')}
        >
          <Toggle
            enabled={includeRestoration}
            onChange={setIncludeRestoration}
          />
        </SettingSection>

        {/* Haptics */}
        <SettingSection
          title={t('settings.haptics')}
          description={t('settings.hapticsDesc')}
        >
          <Toggle
            enabled={hapticsEnabled}
            onChange={setHapticsEnabled}
          />
        </SettingSection>

        {/* About */}
        <SettingSection title={t('settings.about')}>
          <div className="text-sm text-ancient-400">
            <p>{t('settings.version')}: 0.1.0</p>
          </div>
        </SettingSection>
      </div>
    </div>
  );
}

function SettingSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-ancient-200">{title}</h3>
          {description && (
            <p className="text-xs text-ancient-500 mt-0.5">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

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
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive
          ? 'bg-gold-500 text-ancient-900'
          : 'bg-ancient-800 text-ancient-300 hover:bg-ancient-700'
      }`}
    >
      {label}
    </button>
  );
}

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        enabled ? 'bg-gold-500' : 'bg-ancient-700'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

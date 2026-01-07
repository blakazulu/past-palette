import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColorScheme } from '@/types/artifact';
import { useSettingsStore } from '@/stores/appStore';
import { ColorSchemeSelector } from './ColorSchemeSelector';
import { ColorizationProgress, type ColorizationStep } from './ColorizationProgress';

interface ColorizationCardProps {
  onColorize: (scheme: ColorScheme, customPrompt?: string, includeRestoration?: boolean) => void;
  step: ColorizationStep;
  progress: number;
  error?: string;
  disabled?: boolean;
}

export function ColorizationCard({
  onColorize,
  step,
  progress,
  error,
  disabled = false,
}: ColorizationCardProps) {
  const { t } = useTranslation();
  const defaultScheme = useSettingsStore((s) => s.defaultColorScheme);
  const settingsRestoration = useSettingsStore((s) => s.includeRestoration);

  const [selectedScheme, setSelectedScheme] = useState<ColorScheme>(defaultScheme);
  const [customPrompt, setCustomPrompt] = useState('');
  const [includeRestoration, setIncludeRestoration] = useState(settingsRestoration);

  const isProcessing = step !== 'idle' && step !== 'complete' && step !== 'error';
  const isComplete = step === 'complete';
  const isError = step === 'error';

  const handleSubmit = () => {
    if (selectedScheme === 'custom' && !customPrompt.trim()) return;
    onColorize(
      selectedScheme,
      selectedScheme === 'custom' ? customPrompt : undefined,
      includeRestoration
    );
  };

  return (
    <div className="bg-ancient-900/50 border border-ancient-700 rounded-2xl p-5 space-y-5">
      <h2 className="text-lg font-semibold text-ancient-100">
        {t('colorization.title')}
      </h2>

      {/* Color scheme selector */}
      <ColorSchemeSelector
        selected={selectedScheme}
        onSelect={setSelectedScheme}
        disabled={isProcessing || disabled}
      />

      {/* Custom prompt input */}
      {selectedScheme === 'custom' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ancient-300">
            {t('colorization.customPromptLabel')}
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder={t('colorization.customPromptPlaceholder')}
            disabled={isProcessing || disabled}
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-ancient-800 border border-ancient-700 text-ancient-100 placeholder:text-ancient-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 resize-none disabled:opacity-50"
          />
        </div>
      )}

      {/* Restoration toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ancient-200">
            {t('colorization.includeRestoration')}
          </p>
          <p className="text-xs text-ancient-500">
            {t('colorization.restorationHint')}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={includeRestoration}
          disabled={isProcessing || disabled}
          onClick={() => setIncludeRestoration(!includeRestoration)}
          className={`
            relative w-11 h-6 rounded-full transition-colors
            ${includeRestoration ? 'bg-gold-500' : 'bg-ancient-600'}
            ${isProcessing || disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span
            className={`
              absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
              ${includeRestoration ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>

      {/* Progress */}
      {(isProcessing || isComplete || isError) && (
        <ColorizationProgress
          step={step}
          progress={progress}
          error={error}
        />
      )}

      {/* Action button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={
          isProcessing ||
          disabled ||
          (selectedScheme === 'custom' && !customPrompt.trim())
        }
        className={`
          w-full py-3 rounded-xl font-semibold transition-all
          ${
            isProcessing || disabled
              ? 'bg-ancient-700 text-ancient-400 cursor-not-allowed'
              : 'bg-gold-500 text-ancient-900 hover:bg-gold-400 active:scale-[0.98]'
          }
        `}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <SpinnerIcon className="w-5 h-5 animate-spin" />
            {t('colorization.processing')}
          </span>
        ) : isComplete ? (
          t('colorization.colorizeAnother')
        ) : (
          t('colorization.colorize')
        )}
      </button>

      {/* Speculative notice */}
      <p className="text-xs text-ancient-500 text-center">
        {t('colorization.speculativeNotice')}
      </p>
    </div>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

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
    <div className="glass-panel rounded-2xl p-4 sm:p-6 space-y-5 max-w-2xl mx-auto">
      {/* Title */}
      <h2 className="text-lg sm:text-xl font-display uppercase tracking-wider text-gold-400">
        {t('colorization.title')}
      </h2>

      {/* Color scheme selector - now a beautiful 6-item grid */}
      <ColorSchemeSelector
        selected={selectedScheme}
        onSelect={setSelectedScheme}
        disabled={isProcessing || disabled}
      />

      {/* Custom prompt input */}
      {selectedScheme === 'custom' && (
        <div className="space-y-2 animate-reveal-up">
          <label className="block text-base font-medium text-gold-400/80 font-display uppercase tracking-wider">
            {t('colorization.customPromptLabel')}
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder={t('colorization.customPromptPlaceholder')}
            disabled={isProcessing || disabled}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-obsidian-900/60 border border-gold-500/20 text-obsidian-100 placeholder:text-obsidian-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500/50 resize-none disabled:opacity-50 transition-all"
          />
        </div>
      )}

      {/* Restoration toggle */}
      <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-obsidian-900/40 border border-gold-500/10">
        <div className="flex-1 mr-4">
          <p className="text-base font-medium text-obsidian-100">
            {t('colorization.includeRestoration')}
          </p>
          <p className="text-sm text-obsidian-400 mt-0.5">
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
            toggle-ancient flex-shrink-0
            ${includeRestoration ? 'active' : ''}
            ${isProcessing || disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <span className="toggle-knob" />
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
          w-full py-4 rounded-xl font-display uppercase tracking-wider text-base font-semibold transition-all
          ${
            isProcessing || disabled || (selectedScheme === 'custom' && !customPrompt.trim())
              ? 'bg-obsidian-800 text-obsidian-500 cursor-not-allowed border border-obsidian-700'
              : 'btn-gold'
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
      <p className="text-sm text-obsidian-400 text-center leading-relaxed">
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

import { useTranslation } from 'react-i18next';

export type ColorizationStep = 'idle' | 'preparing' | 'colorizing' | 'saving' | 'complete' | 'error';

interface ColorizationProgressProps {
  step: ColorizationStep;
  progress: number; // 0-100
  message?: string;
  error?: string;
}

export function ColorizationProgress({
  step,
  progress,
  message,
  error,
}: ColorizationProgressProps) {
  const { t } = useTranslation();

  if (step === 'idle') return null;

  const isError = step === 'error';
  const isComplete = step === 'complete';

  const getStepMessage = () => {
    if (message) return message;
    switch (step) {
      case 'preparing':
        return t('colorization.statusPreparing');
      case 'colorizing':
        return t('colorization.statusColorizing');
      case 'saving':
        return t('colorization.statusSaving');
      case 'complete':
        return t('colorization.statusComplete');
      case 'error':
        return error || t('colorization.statusError');
      default:
        return '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="relative h-2 bg-ancient-700 rounded-full overflow-hidden">
        <div
          className={`
            absolute inset-y-0 left-0 rounded-full transition-all duration-300
            ${isError ? 'bg-red-500' : isComplete ? 'bg-green-500' : 'bg-gold-500'}
          `}
          style={{ width: `${progress}%` }}
        />
        {/* Animated shine effect when processing */}
        {!isError && !isComplete && progress > 0 && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
        )}
      </div>

      {/* Status message */}
      <div className="flex items-center gap-2">
        {/* Status icon */}
        {isError ? (
          <ErrorIcon className="w-5 h-5 text-red-500" />
        ) : isComplete ? (
          <CheckIcon className="w-5 h-5 text-green-500" />
        ) : (
          <SpinnerIcon className="w-5 h-5 text-gold-500 animate-spin" />
        )}

        {/* Message */}
        <span
          className={`text-base ${
            isError ? 'text-red-400' : isComplete ? 'text-green-400' : 'text-ancient-300'
          }`}
        >
          {getStepMessage()}
        </span>

        {/* Progress percentage */}
        {!isError && !isComplete && (
          <span className="text-base text-ancient-500 ml-auto">{Math.round(progress)}%</span>
        )}
      </div>
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
      />
    </svg>
  );
}

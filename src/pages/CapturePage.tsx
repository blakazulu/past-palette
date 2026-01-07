import { useTranslation } from 'react-i18next';

export function CapturePage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-16 h-16 rounded-full bg-ancient-800 border border-ancient-700 flex items-center justify-center mb-4">
        <CameraIcon className="w-8 h-8 text-ancient-400" />
      </div>
      <h1 className="text-xl font-semibold text-ancient-100 mb-2">
        {t('capture.title')}
      </h1>
      <p className="text-sm text-ancient-400 text-center">
        {t('capture.takePhoto')} / {t('capture.uploadImage')}
      </p>
      <p className="text-xs text-ancient-500 mt-4">Coming in Phase 4</p>
    </div>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

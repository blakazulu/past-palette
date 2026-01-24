import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUploadStore } from '@/stores/uploadStore';

export function UploadProgress() {
  const { t } = useTranslation();
  const { currentUpload, clearUpload } = useUploadStore();

  // Auto-dismiss success after 3 seconds
  useEffect(() => {
    if (currentUpload?.status === 'success') {
      const timer = setTimeout(clearUpload, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentUpload?.status, clearUpload]);

  if (!currentUpload) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div
        className={`rounded-xl p-4 shadow-lg ${
          currentUpload.status === 'success'
            ? 'bg-green-900/90'
            : currentUpload.status === 'error'
            ? 'bg-red-900/90'
            : 'bg-obsidian-800/90'
        } backdrop-blur-sm border border-obsidian-600`}
      >
        <div className="flex items-center gap-3">
          {currentUpload.status === 'uploading' && (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gold-500" />
          )}
          {currentUpload.status === 'success' && (
            <span className="text-green-400 text-xl">✓</span>
          )}
          {currentUpload.status === 'error' && (
            <span className="text-red-400 text-xl">✕</span>
          )}

          <div className="flex-1">
            <p className="text-obsidian-100 text-sm font-medium">
              {currentUpload.status === 'uploading' &&
                t('upload.uploading', 'Uploading to gallery...')}
              {currentUpload.status === 'success' &&
                t('upload.success', 'Uploaded to gallery!')}
              {currentUpload.status === 'error' &&
                t('upload.error', 'Upload failed')}
            </p>
            {currentUpload.error && (
              <p className="text-red-300 text-xs mt-1">{currentUpload.error}</p>
            )}
          </div>

          {currentUpload.status !== 'uploading' && (
            <button
              type="button"
              onClick={clearUpload}
              className="text-obsidian-400 hover:text-obsidian-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

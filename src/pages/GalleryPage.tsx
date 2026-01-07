import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function GalleryPage() {
  const { t } = useTranslation();

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-ancient-50 mb-6">{t('gallery.title')}</h1>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-16 h-16 rounded-full bg-ancient-800 border border-ancient-700 flex items-center justify-center mb-4">
          <GalleryIcon className="w-8 h-8 text-ancient-400" />
        </div>
        <p className="text-ancient-300 mb-2">{t('gallery.empty')}</p>
        <p className="text-sm text-ancient-500 text-center mb-6">
          {t('gallery.emptyHint')}
        </p>
        <Link
          to="/capture"
          className="px-6 py-3 rounded-xl bg-gold-500 text-ancient-900 font-semibold"
        >
          {t('home.getStarted')}
        </Link>
      </div>
    </div>
  );
}

function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

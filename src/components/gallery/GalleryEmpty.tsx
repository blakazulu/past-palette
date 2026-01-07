import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function GalleryEmpty() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 rounded-full bg-ancient-800 border border-ancient-700 flex items-center justify-center mb-4">
        <GalleryIcon className="w-10 h-10 text-ancient-500" />
      </div>
      <p className="text-lg text-ancient-300 mb-2">{t('gallery.empty')}</p>
      <p className="text-sm text-ancient-500 text-center mb-6 max-w-xs">
        {t('gallery.emptyHint')}
      </p>
      <Link
        to="/capture"
        className="px-6 py-3 rounded-xl bg-gold-500 text-ancient-900 font-semibold hover:bg-gold-400 transition-colors"
      >
        {t('home.getStarted')}
      </Link>
    </div>
  );
}

function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

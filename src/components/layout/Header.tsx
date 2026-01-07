import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 bg-ancient-900/95 backdrop-blur-sm border-b border-ancient-800">
      <div className="flex items-center justify-between px-4 h-14">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
            <span className="text-ancient-900 font-bold text-sm">PP</span>
          </div>
          <span className="font-semibold text-ancient-50">{t('app.name')}</span>
        </Link>
      </div>
    </header>
  );
}

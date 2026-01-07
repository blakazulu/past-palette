import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center px-4 py-8">
      {/* Hero section */}
      <div className="text-center space-y-6 max-w-md">
        {/* Logo */}
        <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
          <span className="text-ancient-900 font-bold text-2xl">PP</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gold-400 to-gold-200 bg-clip-text text-transparent">
          {t('app.name')}
        </h1>

        {/* Tagline */}
        <p className="text-ancient-300 text-lg">
          {t('app.tagline')}
        </p>

        {/* Description */}
        <p className="text-ancient-400 text-sm leading-relaxed">
          {t('home.subtitle')}
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs mt-10">
        <Link
          to="/capture"
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-ancient-900 font-semibold shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 transition-shadow"
        >
          <CameraIcon className="w-5 h-5" />
          {t('home.getStarted')}
        </Link>

        <Link
          to="/gallery"
          className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-ancient-800 border border-ancient-700 text-ancient-100 font-medium hover:bg-ancient-750 transition-colors"
        >
          <GalleryIcon className="w-5 h-5" />
          {t('home.viewGallery')}
        </Link>
      </div>

      {/* Color scheme preview */}
      <div className="mt-12 w-full max-w-sm">
        <h2 className="text-sm font-medium text-ancient-400 mb-4 text-center">
          {t('colorization.title')}
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {colorSchemes.map((scheme) => (
            <div key={scheme.id} className="flex flex-col items-center gap-2">
              <div className="flex gap-0.5">
                {scheme.swatches.map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-sm first:rounded-l last:rounded-r"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-xs text-ancient-500">{t(`schemes.${scheme.id}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const colorSchemes = [
  { id: 'egyptian', swatches: ['#1E3F66', '#FFD700', '#40E0D0', '#228B22'] },
  { id: 'roman', swatches: ['#C41E3A', '#1E4D8C', '#DAA520', '#CD853F'] },
  { id: 'greek', swatches: ['#D2691E', '#1C1C1C', '#4169E1', '#FFFAF0'] },
  { id: 'mesopotamian', swatches: ['#000080', '#B8860B', '#8B4513', '#1C1C1C'] },
];

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

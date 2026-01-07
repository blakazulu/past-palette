import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function GalleryEmpty() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 opacity-0-initial animate-reveal-up">
      {/* Decorative illustration */}
      <div className="relative mb-8">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-radial from-gold-500/10 to-transparent blur-2xl scale-150" />

        {/* Main icon container */}
        <div className="relative w-24 h-24 rounded-2xl glass-panel flex items-center justify-center border-gold-pulse">
          <VaseIcon className="w-12 h-12 text-gold-500/60" />
        </div>

        {/* Decorative sparkles */}
        <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-gold-400/40 animate-pulse" />
        <div className="absolute -bottom-1 -left-3 w-2 h-2 rounded-full bg-gold-500/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Title */}
      <h2 className="text-xl sm:text-2xl text-obsidian-100 mb-3 text-center">
        {t('gallery.emptyTitle') || 'Your Collection Awaits'}
      </h2>

      {/* Description */}
      <p className="text-obsidian-400 text-center max-w-sm mb-2 leading-relaxed">
        {t('gallery.empty')}
      </p>
      <p className="text-obsidian-500 text-sm text-center max-w-xs mb-8">
        {t('gallery.emptyHint')}
      </p>

      {/* Hieroglyph divider */}
      <div className="divider-hieroglyph w-48 mb-8">
        <ScarabIcon className="w-5 h-5" />
      </div>

      {/* CTA Button */}
      <Link to="/capture" className="btn-gold text-sm">
        <span className="flex items-center gap-2">
          <CameraIcon className="w-4 h-4" />
          {t('home.getStarted')}
        </span>
      </Link>
    </div>
  );
}

function VaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 3h6M8 6h8M7 6c-.5 2-1 5-1 8 0 4 2 7 6 7s6-3 6-7c0-3-.5-6-1-8"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12c0 1 .5 2 3 2s3-1 3-2"
      />
    </svg>
  );
}

function ScarabIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.5 2 5.5 4.5 5.5 8c0 2 1 3.5 2.5 4.5v3c0 1.5 1 3 2.5 3.5v1.5c0 .5.5 1 1 1h1c.5 0 1-.5 1-1V19c1.5-.5 2.5-2 2.5-3.5v-3c1.5-1 2.5-2.5 2.5-4.5 0-3.5-3-6-6-6zm-3 6c0-.5.5-1 1-1s1 .5 1 1-.5 1-1 1-1-.5-1-1zm6 0c0 .5-.5 1-1 1s-1-.5-1-1 .5-1 1-1 1 .5 1 1z"/>
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
      />
    </svg>
  );
}

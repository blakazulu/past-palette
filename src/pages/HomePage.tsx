import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

const colorSchemes = [
  { id: 'mesopotamian', gradient: 'from-amber-700 to-yellow-600', label: 'Mesopotamian', icon: '𒀭' },
  { id: 'egyptian', gradient: 'from-blue-700 to-cyan-500', label: 'Egyptian', icon: '𓂀' },
  { id: 'roman', gradient: 'from-red-800 to-red-600', label: 'Roman', icon: '🏛' },
  { id: 'greek', gradient: 'from-orange-700 to-amber-500', label: 'Greek', icon: '🏺' },
];

// Generate floating dust particles
function generateDustParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 15}s`,
    duration: `${12 + Math.random() * 8}s`,
    size: Math.random() * 3 + 1,
  }));
}

export function HomePage() {
  const { t } = useTranslation();
  const dustParticles = useMemo(() => generateDustParticles(25), []);

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Floating dust particles */}
      <div className="dust-container">
        {dustParticles.map((particle) => (
          <div
            key={particle.id}
            className="dust-particle"
            style={{
              left: particle.left,
              bottom: '-10px',
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8">
        {/* Hero section with logo */}
        <div className="relative mb-6 sm:mb-8 opacity-0-initial animate-reveal-scale">
          <div className="relative animate-float">
            {/* AI Badge */}
            <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-20">
              <div className="bg-gradient-to-br from-gold-400 to-gold-600 text-obsidian-950 font-bold text-sm px-3 py-1 rounded-full shadow-lg shadow-gold-500/30 font-display">
                AI
              </div>
            </div>
            <img
              src="/logo-full.png"
              alt="Past Palette"
              className="w-48 sm:w-56 md:w-64 h-auto drop-shadow-2xl"
            />
            {/* Golden ethereal glow */}
            <div className="absolute inset-0 -z-10 bg-gradient-radial from-gold-400/30 via-gold-500/10 to-transparent blur-2xl scale-150" />
          </div>
        </div>

        {/* Tagline with shimmer effect */}
        <h1 className="shimmer-gold text-transparent text-xl sm:text-2xl md:text-3xl font-display uppercase tracking-widest mb-3 sm:mb-4 opacity-0-initial animate-reveal-up delay-100">
          {t('app.tagline')}
        </h1>

        {/* Subtitle */}
        <p className="text-obsidian-200 text-base md:text-lg text-center max-w-md mb-8 sm:mb-10 opacity-0-initial animate-reveal-up delay-200 leading-relaxed px-4">
          {t('home.subtitle')}
        </p>

        {/* Color scheme preview pills */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 opacity-0-initial animate-reveal-up delay-300 px-4">
          {colorSchemes.map((scheme, index) => (
            <div
              key={scheme.id}
              className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-obsidian-900/60 border border-gold-500/20 hover:border-gold-400/50 transition-all duration-300 hover:scale-105 cursor-default"
              style={{ animationDelay: `${300 + index * 50}ms` }}
            >
              <span className="text-base sm:text-lg">{scheme.icon}</span>
              <span className="text-sm text-obsidian-200 font-display uppercase tracking-wider group-hover:text-gold-300 transition-colors">
                {t(`colorSchemes.${scheme.id}`)}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="w-full max-w-xs sm:max-w-sm px-4 opacity-0-initial animate-reveal-up delay-400">
          <Link
            to="/capture"
            className="btn-gold block w-full text-center text-base py-4"
          >
            {t('home.getStarted')}
          </Link>
        </div>

        {/* Secondary action */}
        <Link
          to="/gallery"
          className="mt-4 sm:mt-5 text-gold-400/80 hover:text-gold-300 text-base font-display uppercase tracking-widest transition-colors opacity-0-initial animate-reveal-fade delay-500 flex items-center gap-2"
        >
          {t('home.viewGallery')}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Bottom decorative element */}
        <div className="mt-10 sm:mt-14 flex items-center gap-3 opacity-0-initial animate-reveal-fade delay-600">
          <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-gold-600/50 to-transparent" />
          <AnkhIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gold-500/50" />
          <div className="w-12 sm:w-16 h-px bg-gradient-to-l from-transparent via-gold-600/50 to-transparent" />
        </div>
      </div>
    </div>
  );
}

function AnkhIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c-2.2 0-4 1.8-4 4 0 1.5.8 2.8 2 3.5V11H7v2h3v9h4v-9h3v-2h-3V9.5c1.2-.7 2-2 2-3.5 0-2.2-1.8-4-4-4zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
    </svg>
  );
}

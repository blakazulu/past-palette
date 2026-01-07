import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

const colorSchemes = [
  { id: 'egyptian', color: '#1E3F66', accent: '#fcd34d', label: 'Egyptian', icon: '𓂀' },
  { id: 'roman', color: '#8B2942', accent: '#d4a418', label: 'Roman', icon: '🏛' },
  { id: 'greek', color: '#1a4d5c', accent: '#f5b092', label: 'Greek', icon: '🏺' },
  { id: 'mesopotamian', color: '#5c4a1f', accent: '#fcd34d', label: 'Mesopotamian', icon: '𒀭' },
  { id: 'byzantine', color: '#4a1f5c', accent: '#d4a418', label: 'Byzantine', icon: '☦' },
];

// Generate dust particles
function generateDustParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 15}s`,
    duration: `${12 + Math.random() * 8}s`,
    size: Math.random() * 2 + 1,
  }));
}

export function HomePage() {
  const { t } = useTranslation();
  const dustParticles = useMemo(() => generateDustParticles(20), []);

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0">
        {/* Base gradient - deep tomb darkness */}
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950" />

        {/* Radial ambient glow */}
        <div className="absolute inset-0 bg-gradient-radial from-gold-500/5 via-transparent to-transparent" />

        {/* Stars/dust layer */}
        <div className="absolute inset-0 overflow-hidden opacity-60">
          <div className="stars-layer" />
        </div>

        {/* Top golden light beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-radial from-gold-500/10 via-gold-500/5 to-transparent blur-3xl" />

        {/* Bottom lapis glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-radial from-lapis-700/15 via-transparent to-transparent blur-3xl" />
      </div>

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
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Logo with ethereal glow */}
        <div className="relative mb-8 opacity-0-initial animate-reveal-scale">
          <div className="relative animate-float">
            <img
              src="/logo-full.png"
              alt="Past Palette"
              className="w-52 sm:w-64 md:w-72 h-auto drop-shadow-2xl"
            />
            {/* Golden ethereal glow */}
            <div className="absolute inset-0 -z-10 bg-gradient-radial from-gold-400/25 via-gold-500/10 to-transparent blur-2xl scale-150" />
          </div>
        </div>

        {/* Tagline with shimmer */}
        <p className="text-gold-400/80 text-xs sm:text-sm tracking-[0.3em] uppercase font-display mb-10 opacity-0-initial animate-reveal-up delay-200">
          {t('app.tagline')}
        </p>

        {/* Main panel */}
        <div className="w-full max-w-md glass-panel rounded-2xl p-6 sm:p-8 opacity-0-initial animate-reveal-up delay-300 frame-archaeological">
          {/* Decorative corner accents handled by frame-archaeological class */}

          {/* Section header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl text-obsidian-50 mb-3 text-carved">
              {t('home.title')}
            </h1>
            <p className="text-obsidian-300 text-base sm:text-lg leading-relaxed">
              {t('home.subtitle')}
            </p>
          </div>

          {/* Hieroglyph divider */}
          <div className="divider-hieroglyph my-8">
            <ScarabIcon className="w-6 h-6" />
          </div>

          {/* Color scheme showcase */}
          <div className="mb-8">
            <p className="text-xs text-gold-500/70 uppercase tracking-[0.2em] font-display mb-5 text-center">
              {t('home.colorSchemes') || 'Historical Palettes'}
            </p>
            <div className="flex justify-center items-center gap-3 sm:gap-4">
              {colorSchemes.map((scheme, index) => (
                <div
                  key={scheme.id}
                  className="group flex flex-col items-center gap-2 opacity-0-initial animate-reveal-scale"
                  style={{ animationDelay: `${400 + index * 100}ms` }}
                >
                  <div
                    className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 border-gold-600/30 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:border-gold-400/60 group-hover:shadow-gold-500/20 group-hover:shadow-xl"
                    style={{ backgroundColor: scheme.color }}
                  >
                    {/* Inner glow */}
                    <div
                      className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${scheme.accent}40, transparent 60%)`
                      }}
                    />
                    {/* Cultural icon */}
                    <span className="absolute inset-0 flex items-center justify-center text-lg sm:text-xl opacity-60 group-hover:opacity-100 transition-opacity">
                      {scheme.icon}
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-obsidian-400 font-display tracking-wider uppercase group-hover:text-gold-400 transition-colors">
                    {t(`colorSchemes.${scheme.id}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link
              to="/capture"
              className="btn-gold block w-full text-center text-sm sm:text-base"
            >
              {t('home.getStarted')}
            </Link>

            <Link
              to="/gallery"
              className="btn-ghost block w-full text-center text-sm"
            >
              {t('home.viewGallery')}
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        {/* Bottom decorative element */}
        <div className="mt-10 flex items-center gap-3 opacity-0-initial animate-reveal-fade delay-600">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold-600/40 to-transparent" />
          <AnkhIcon className="w-5 h-5 text-gold-500/40" />
          <div className="w-16 h-px bg-gradient-to-l from-transparent via-gold-600/40 to-transparent" />
        </div>
      </div>
    </div>
  );
}

// Custom Icons
function ScarabIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.5 2 5.5 4.5 5.5 8c0 2 1 3.5 2.5 4.5v3c0 1.5 1 3 2.5 3.5v1.5c0 .5.5 1 1 1h1c.5 0 1-.5 1-1V19c1.5-.5 2.5-2 2.5-3.5v-3c1.5-1 2.5-2.5 2.5-4.5 0-3.5-3-6-6-6zm-3 6c0-.5.5-1 1-1s1 .5 1 1-.5 1-1 1-1-.5-1-1zm6 0c0 .5-.5 1-1 1s-1-.5-1-1 .5-1 1-1 1 .5 1 1z"/>
    </svg>
  );
}

function AnkhIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c-2.2 0-4 1.8-4 4 0 1.5.8 2.8 2 3.5V11H7v2h3v9h4v-9h3v-2h-3V9.5c1.2-.7 2-2 2-3.5 0-2.2-1.8-4-4-4zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
    </svg>
  );
}

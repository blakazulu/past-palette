import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 glass-panel-dark border-b border-gold-600/10">
      <div className="flex items-center justify-between px-4 h-16">
        <Link to="/" className="flex items-center gap-3 group">
          {/* Logo */}
          <div className="relative">
            <img
              src="/logo-64.png"
              alt="Past Palette"
              className="w-10 h-10 transition-transform duration-300 group-hover:scale-105"
            />
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 bg-gradient-radial from-gold-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-lg scale-150" />
          </div>

          {/* Brand name */}
          <span className="font-display text-lg tracking-wider uppercase">
            <span className="shimmer-gold text-transparent">Past</span>
            <span className="text-obsidian-200">Palette</span>
          </span>
        </Link>

        {/* Optional: Page indicator */}
        {!isHome && (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gold-500/60 animate-pulse" />
          </div>
        )}
      </div>

      {/* Subtle bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
    </header>
  );
}

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Artifact } from '@/types/artifact';

interface ArtifactCardProps {
  artifact: Artifact;
  index?: number;
}

export function ArtifactCard({ artifact, index = 0 }: ArtifactCardProps) {
  const { t } = useTranslation();

  const thumbnailUrl = useMemo(() => {
    if (artifact.thumbnailBlob) {
      return URL.createObjectURL(artifact.thumbnailBlob);
    }
    return null;
  }, [artifact.thumbnailBlob]);

  const statusConfig = {
    draft: { color: 'bg-obsidian-500', label: 'Draft' },
    'images-captured': { color: 'bg-lapis-500', label: 'Ready' },
    colorizing: { color: 'bg-gold-500 animate-pulse', label: 'Processing' },
    complete: { color: 'bg-green-500', label: 'Complete' },
    error: { color: 'bg-red-500', label: 'Error' },
  }[artifact.status] || { color: 'bg-obsidian-500', label: '' };

  const variantCount = artifact.colorVariantIds.length;

  return (
    <Link
      to={`/artifact/${artifact.id}`}
      className="artifact-card group block aspect-[4/5] img-hover-zoom opacity-0-initial animate-reveal-scale"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Thumbnail */}
      <div className="relative w-full h-full">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={artifact.metadata.name || t('artifact.original')}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-obsidian-800 to-obsidian-900">
            <PlaceholderIcon className="w-12 h-12 text-obsidian-600" />
          </div>
        )}

        {/* Overlay gradient - stronger on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/40 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

        {/* Top status bar */}
        <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
            <span className="text-sm text-obsidian-300 font-display tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity">
              {statusConfig.label}
            </span>
          </div>

          {/* Variant count badge */}
          {variantCount > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gold-500/20 backdrop-blur-sm border border-gold-500/30">
              <ColorPaletteIcon className="w-3 h-3 text-gold-400" />
              <span className="text-sm text-gold-300 font-display">{variantCount}</span>
            </div>
          )}
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Decorative line */}
          <div className="w-8 h-0.5 bg-gradient-to-r from-gold-500 to-transparent mb-3 group-hover:w-16 transition-all duration-500" />

          {/* Name */}
          <h3 className="font-display text-base text-obsidian-50 tracking-wide uppercase truncate mb-1">
            {artifact.metadata.name || t('artifact.untitled')}
          </h3>

          {/* Meta info */}
          <div className="flex items-center gap-3 text-sm text-obsidian-400">
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              {formatDate(artifact.createdAt)}
            </span>
            {artifact.metadata.siteName && (
              <span className="text-gold-500/70 truncate max-w-[80px]">
                {artifact.metadata.siteName}
              </span>
            )}
          </div>
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-radial from-gold-500/0 to-transparent group-hover:from-gold-500/5 transition-all duration-500 pointer-events-none" />
      </div>
    </Link>
  );
}

function formatDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function PlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}

function ColorPaletteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"
      />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  );
}

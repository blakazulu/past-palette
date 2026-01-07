import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Artifact } from '@/types/artifact';

interface ArtifactCardProps {
  artifact: Artifact;
}

export function ArtifactCard({ artifact }: ArtifactCardProps) {
  const { t } = useTranslation();

  const thumbnailUrl = useMemo(() => {
    if (artifact.thumbnailBlob) {
      return URL.createObjectURL(artifact.thumbnailBlob);
    }
    return null;
  }, [artifact.thumbnailBlob]);

  const statusColor = {
    draft: 'bg-ancient-600',
    'images-captured': 'bg-egyptian-600',
    colorizing: 'bg-gold-500',
    complete: 'bg-success-500',
    error: 'bg-error-500',
  }[artifact.status];

  const variantCount = artifact.colorVariantIds.length;

  return (
    <Link
      to={`/artifact/${artifact.id}`}
      className="group relative aspect-square rounded-xl overflow-hidden bg-ancient-800 border border-ancient-700 hover:border-ancient-600 transition-colors"
    >
      {/* Thumbnail */}
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={artifact.metadata.name || t('artifact.original')}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <PlaceholderIcon className="w-12 h-12 text-ancient-600" />
        </div>
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-ancient-900/80 via-transparent to-transparent" />

      {/* Status indicator */}
      <div className="absolute top-2 right-2">
        <div className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        {artifact.metadata.name && (
          <p className="text-sm font-medium text-ancient-100 truncate">
            {artifact.metadata.name}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {variantCount > 0 && (
            <span className="text-xs text-ancient-400 flex items-center gap-1">
              <ColorPaletteIcon className="w-3 h-3" />
              {variantCount}
            </span>
          )}
          <span className="text-xs text-ancient-500">
            {formatDate(artifact.createdAt)}
          </span>
        </div>
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
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function ColorPaletteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
    </svg>
  );
}

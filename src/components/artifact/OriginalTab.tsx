import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ArtifactImage, ArtifactMetadata } from '@/types/artifact';
import { downloadOriginalImage } from '@/lib/utils/export';

interface OriginalTabProps {
  image: ArtifactImage | undefined;
  metadata: ArtifactMetadata;
  artifactName?: string;
}

export function OriginalTab({ image, metadata, artifactName }: OriginalTabProps) {
  const { t, i18n } = useTranslation();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!image) return;
    const url = URL.createObjectURL(image.blob);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleDownload = () => {
    if (image) {
      downloadOriginalImage(image.blob, artifactName);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return null;
    return new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'medium',
    }).format(new Date(date));
  };

  if (!image) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="spinner-gold mb-4" />
        <p className="text-obsidian-400 font-display tracking-wider">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Original image with frame */}
      <div className="relative frame-archaeological rounded-xl overflow-hidden">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={artifactName || t('artifact.original')}
            className="w-full h-auto"
          />
        )}
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/20 to-transparent pointer-events-none" />
      </div>

      {/* Download button */}
      <button
        type="button"
        onClick={handleDownload}
        className="btn-ghost w-full flex items-center justify-center gap-2"
      >
        <DownloadIcon className="w-5 h-5" />
        {t('artifact.download')}
      </button>

      {/* Metadata */}
      {(metadata.discoveryLocation || metadata.siteName || metadata.dateFound || metadata.notes) && (
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-obsidian-800/80 flex items-center justify-center">
              <InfoIcon className="w-4 h-4 text-gold-500/70" />
            </div>
            <h3 className="font-display text-base tracking-wider uppercase text-obsidian-200">
              {t('artifact.details') || 'Details'}
            </h3>
          </div>

          <div className="space-y-3">
            {metadata.siteName && (
              <MetadataRow icon={<LocationIcon />} label={t('artifact.site') || 'Site'} value={metadata.siteName} />
            )}
            {metadata.discoveryLocation && (
              <MetadataRow icon={<MapIcon />} label={t('artifact.location') || 'Location'} value={metadata.discoveryLocation} />
            )}
            {metadata.dateFound && (
              <MetadataRow icon={<CalendarIcon />} label={t('artifact.dateFound') || 'Date Found'} value={formatDate(metadata.dateFound)} />
            )}
          </div>

          {metadata.notes && (
            <div className="pt-3 border-t border-obsidian-700/50">
              <p className="text-sm text-obsidian-500 mb-2 font-display tracking-wider uppercase">{t('artifact.notes') || 'Notes'}</p>
              <p className="text-base text-obsidian-300 leading-relaxed">{metadata.notes}</p>
            </div>
          )}

          {metadata.tags && metadata.tags.length > 0 && (
            <div className="pt-3 border-t border-obsidian-700/50">
              <p className="text-sm text-obsidian-500 mb-2 font-display tracking-wider uppercase">{t('artifact.tags') || 'Tags'}</p>
              <div className="flex flex-wrap gap-2">
                {metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 text-sm rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 font-display tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image dimensions */}
      <div className="flex items-center justify-center gap-2 text-sm text-obsidian-500">
        <DimensionsIcon className="w-4 h-4" />
        <span>{image.width} × {image.height} pixels</span>
      </div>
    </div>
  );
}

function MetadataRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded bg-obsidian-800/60 flex items-center justify-center text-obsidian-500 flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 flex justify-between gap-4">
        <span className="text-base text-obsidian-500">{label}</span>
        <span className="text-base text-obsidian-200 text-right">{value}</span>
      </div>
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function DimensionsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
  );
}

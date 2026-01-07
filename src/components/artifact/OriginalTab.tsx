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
        <p className="text-ancient-400">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Original image */}
      <div className="rounded-xl overflow-hidden bg-ancient-800">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={artifactName || t('artifact.original')}
            className="w-full h-auto"
          />
        )}
      </div>

      {/* Download button */}
      <button
        type="button"
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-ancient-800 text-ancient-200 font-medium hover:bg-ancient-700 transition-colors"
      >
        <DownloadIcon className="w-5 h-5" />
        {t('artifact.download')}
      </button>

      {/* Metadata */}
      {(metadata.discoveryLocation || metadata.siteName || metadata.dateFound || metadata.notes) && (
        <div className="bg-ancient-800/50 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-ancient-200">Details</h3>

          {metadata.siteName && (
            <MetadataRow label="Site" value={metadata.siteName} />
          )}
          {metadata.discoveryLocation && (
            <MetadataRow label="Location" value={metadata.discoveryLocation} />
          )}
          {metadata.dateFound && (
            <MetadataRow label="Date Found" value={formatDate(metadata.dateFound)} />
          )}
          {metadata.notes && (
            <div>
              <p className="text-xs text-ancient-500 mb-1">Notes</p>
              <p className="text-sm text-ancient-300">{metadata.notes}</p>
            </div>
          )}
          {metadata.tags && metadata.tags.length > 0 && (
            <div>
              <p className="text-xs text-ancient-500 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {metadata.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs rounded-full bg-ancient-700 text-ancient-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image info */}
      <div className="text-xs text-ancient-500 text-center">
        {image.width} × {image.height} pixels
      </div>
    </div>
  );
}

function MetadataRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4">
      <span className="text-sm text-ancient-500">{label}</span>
      <span className="text-sm text-ancient-300 text-right">{value}</span>
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  );
}

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { Artifact } from '@/types/artifact';

interface ArtifactHeaderProps {
  artifact: Artifact;
  onDelete?: () => void;
}

export function ArtifactHeader({ artifact, onDelete }: ArtifactHeaderProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'medium',
    }).format(new Date(date));
  };

  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      {/* Back button and info */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigate('/gallery')}
          className="p-2 -ml-2 rounded-lg hover:bg-ancient-800 transition-colors"
        >
          <BackIcon className="w-5 h-5 text-ancient-400" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-ancient-50">
            {artifact.metadata.name || t('artifact.untitled')}
          </h1>
          <p className="text-sm text-ancient-500">
            {formatDate(artifact.createdAt)}
            {artifact.metadata.siteName && (
              <> &middot; {artifact.metadata.siteName}</>
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-2 rounded-lg text-ancient-400 hover:text-red-400 hover:bg-ancient-800 transition-colors"
            aria-label={t('gallery.delete')}
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

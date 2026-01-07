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

  const statusConfig = {
    draft: { color: 'bg-obsidian-500', labelKey: 'artifact.status.draft' },
    'images-captured': { color: 'bg-lapis-500', labelKey: 'artifact.status.ready' },
    colorizing: { color: 'bg-gold-500 animate-pulse', labelKey: 'artifact.status.processing' },
    complete: { color: 'bg-green-500', labelKey: 'artifact.status.complete' },
    error: { color: 'bg-red-500', labelKey: 'artifact.status.error' },
  }[artifact.status] || { color: 'bg-obsidian-500', labelKey: '' };

  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      {/* Back button and info */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigate('/gallery')}
          className="p-2.5 -ml-2 rounded-xl glass-panel hover:border-gold-500/30 transition-all group"
        >
          <BackIcon className="w-5 h-5 text-obsidian-400 group-hover:text-gold-400 transition-colors" />
        </button>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl sm:text-2xl text-obsidian-50">
              {artifact.metadata.name || t('artifact.untitled')}
            </h1>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-obsidian-800/80">
              <div className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
              <span className="text-sm text-obsidian-400 font-display tracking-wider uppercase">
                {statusConfig.labelKey && t(statusConfig.labelKey)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-obsidian-500">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{formatDate(artifact.createdAt)}</span>
            {artifact.metadata.siteName && (
              <>
                <span className="text-obsidian-600">&middot;</span>
                <span className="text-gold-500/60">{artifact.metadata.siteName}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-2.5 rounded-xl glass-panel text-obsidian-400 hover:text-red-400 hover:border-red-500/30 transition-all group"
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

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';

export function ArtifactDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  return (
    <div className="px-4 py-6">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-full bg-ancient-800 border border-ancient-700 flex items-center justify-center mb-4">
          <ArtifactIcon className="w-8 h-8 text-ancient-400" />
        </div>
        <h1 className="text-xl font-semibold text-ancient-100 mb-2">
          {t('artifact.colors')}
        </h1>
        <p className="text-sm text-ancient-400 text-center mb-2">
          Artifact ID: {id}
        </p>
        <p className="text-xs text-ancient-500 mb-6">Coming in Phase 9</p>
        <Link
          to="/gallery"
          className="px-6 py-3 rounded-xl bg-ancient-800 border border-ancient-700 text-ancient-200"
        >
          {t('nav.gallery')}
        </Link>
      </div>
    </div>
  );
}

function ArtifactIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );
}

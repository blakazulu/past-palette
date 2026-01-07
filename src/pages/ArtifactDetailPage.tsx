import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useArtifactData, useDeleteVariant, useDeleteArtifact } from '@/hooks/useArtifactData';
import { ArtifactHeader, ColorsTab, OriginalTab } from '@/components/artifact';

type TabId = 'colors' | 'original';

export function ArtifactDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabId>('colors');

  const { artifact, variants, primaryImage, isLoading } = useArtifactData(id);
  const deleteVariant = useDeleteVariant();
  const deleteArtifact = useDeleteArtifact();

  const handleDeleteVariant = async (variantId: string) => {
    if (!id) return;
    await deleteVariant(variantId, id);
  };

  const handleDeleteArtifact = async () => {
    if (!id) return;
    if (window.confirm(t('gallery.deleteConfirm'))) {
      await deleteArtifact(id);
      navigate('/gallery');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-ancient-400 mt-4">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!artifact) {
    return (
      <div className="px-4 py-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 rounded-full bg-ancient-800 border border-ancient-700 flex items-center justify-center mb-4">
            <NotFoundIcon className="w-8 h-8 text-ancient-400" />
          </div>
          <h1 className="text-xl font-semibold text-ancient-100 mb-2">
            Artifact not found
          </h1>
          <p className="text-sm text-ancient-400 text-center mb-6">
            This artifact may have been deleted.
          </p>
          <Link
            to="/gallery"
            className="px-6 py-3 rounded-xl bg-gold-500 text-ancient-900 font-semibold"
          >
            {t('nav.gallery')}
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'colors', label: t('artifact.colors') },
    { id: 'original', label: t('artifact.original') },
  ];

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <ArtifactHeader artifact={artifact} onDelete={handleDeleteArtifact} />

      {/* Tabs */}
      <div className="flex border-b border-ancient-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors
              ${
                activeTab === tab.id
                  ? 'text-gold-500 border-b-2 border-gold-500'
                  : 'text-ancient-400 hover:text-ancient-200'
              }
            `}
          >
            {tab.label}
            {tab.id === 'colors' && variants.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-ancient-700 text-ancient-300">
                {variants.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'colors' && (
        <ColorsTab
          artifactId={artifact.id}
          artifactName={artifact.metadata.name}
          variants={variants}
          primaryImage={primaryImage}
          onDeleteVariant={handleDeleteVariant}
        />
      )}

      {activeTab === 'original' && (
        <OriginalTab
          image={primaryImage}
          metadata={artifact.metadata}
          artifactName={artifact.metadata.name}
        />
      )}
    </div>
  );
}

function NotFoundIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

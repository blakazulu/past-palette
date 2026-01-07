import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useArtifactData, useDeleteVariant, useDeleteArtifact, useUpdateArtifactName } from '@/hooks/useArtifactData';
import { ArtifactHeader, ColorsTab, OriginalTab } from '@/components/artifact';

type TabId = 'colors' | 'original';

export function ArtifactDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabId>('colors');

  const { artifact, variants, variantsLoaded, primaryImage, isLoading } = useArtifactData(id);
  const deleteVariant = useDeleteVariant();
  const deleteArtifact = useDeleteArtifact();
  const updateArtifactName = useUpdateArtifactName();

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

  const handleNameChange = async (name: string) => {
    if (!id) return;
    await updateArtifactName(id, name);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="spinner-gold mb-4" />
          <p className="text-obsidian-400 font-display tracking-wider">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!artifact) {
    return (
      <div className="px-4 py-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-0-initial animate-reveal-up">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-2xl glass-panel flex items-center justify-center">
              <NotFoundIcon className="w-10 h-10 text-obsidian-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500/60" />
          </div>
          <h1 className="text-xl sm:text-2xl text-obsidian-100 mb-2">
            {t('artifact.notFound') || 'Artifact not found'}
          </h1>
          <p className="text-base text-obsidian-400 text-center mb-8 max-w-xs">
            {t('artifact.notFoundDesc') || 'This artifact may have been deleted or moved.'}
          </p>
          <Link to="/gallery" className="btn-gold text-base">
            {t('nav.gallery')}
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'colors', label: t('artifact.colors'), icon: <PaletteIcon className="w-4 h-4" /> },
    { id: 'original', label: t('artifact.original'), icon: <ImageIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="opacity-0-initial animate-reveal-up">
        <ArtifactHeader artifact={artifact} onDelete={handleDeleteArtifact} onNameChange={handleNameChange} />
      </div>

      {/* Tabs */}
      <div className="relative mb-6 opacity-0-initial animate-reveal-up delay-100">
        <div className="flex p-1 rounded-xl glass-panel">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                font-display text-sm tracking-wider uppercase transition-all duration-300
                ${activeTab === tab.id
                  ? 'text-obsidian-950'
                  : 'text-obsidian-400 hover:text-obsidian-200'
                }
              `}
            >
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-gold-500 to-gold-400 rounded-lg" />
              )}
              <span className="relative flex items-center gap-2">
                {tab.icon}
                {tab.label}
                {tab.id === 'colors' && variants.length > 0 && (
                  <span className={`px-1.5 py-0.5 text-sm rounded-full ${
                    activeTab === tab.id
                      ? 'bg-obsidian-950/20 text-obsidian-900'
                      : 'bg-obsidian-700 text-obsidian-300'
                  }`}>
                    {variants.length}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>

        {/* Active indicator line */}
        <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
      </div>

      {/* Tab content */}
      <div className="opacity-0-initial animate-reveal-up delay-200">
        {activeTab === 'colors' && (
          <ColorsTab
            artifactId={artifact.id}
            artifactName={artifact.metadata.name}
            variants={variants}
            variantsLoaded={variantsLoaded}
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
    </div>
  );
}

function NotFoundIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function PaletteIcon({ className }: { className?: string }) {
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

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}

import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useGalleryFilters } from '@/hooks/useGalleryFilters';
import {
  GalleryGrid,
  GalleryToolbar,
  GalleryEmpty,
} from '@/components/gallery';

export function GalleryPage() {
  const { t } = useTranslation();

  // Live query for all artifacts
  const artifacts = useLiveQuery(() => db.artifacts.toArray(), []) || [];

  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filteredArtifacts,
  } = useGalleryFilters(artifacts);

  const hasArtifacts = artifacts.length > 0;
  const hasResults = filteredArtifacts.length > 0;

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-ancient-50 mb-6">{t('gallery.title')}</h1>

      {hasArtifacts ? (
        <>
          <GalleryToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            resultCount={filteredArtifacts.length}
          />

          {hasResults ? (
            <GalleryGrid artifacts={filteredArtifacts} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-ancient-400">{t('gallery.empty')}</p>
            </div>
          )}
        </>
      ) : (
        <GalleryEmpty />
      )}
    </div>
  );
}

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
    <div className="px-4 py-6 sm:px-6">
      {/* Page Header */}
      <div className="mb-8 opacity-0-initial animate-reveal-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500/20 to-gold-600/10 flex items-center justify-center">
            <MuseumIcon className="w-4 h-4 text-gold-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl text-obsidian-50">
            {t('gallery.title')}
          </h1>
        </div>
        <p className="text-obsidian-400 text-sm sm:text-base ml-11">
          {hasArtifacts
            ? t('gallery.subtitle', { count: artifacts.length }) ||
              `${artifacts.length} artifact${artifacts.length !== 1 ? 's' : ''} in your collection`
            : t('gallery.emptyHint')}
        </p>
      </div>

      {hasArtifacts ? (
        <>
          <div className="opacity-0-initial animate-reveal-up delay-100">
            <GalleryToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              resultCount={filteredArtifacts.length}
            />
          </div>

          {hasResults ? (
            <div className="opacity-0-initial animate-reveal-up delay-200">
              <GalleryGrid artifacts={filteredArtifacts} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 opacity-0-initial animate-reveal-fade delay-200">
              <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center mb-4">
                <SearchEmptyIcon className="w-8 h-8 text-obsidian-400" />
              </div>
              <p className="text-obsidian-400 font-display tracking-wide">
                {t('gallery.noResults') || 'No artifacts match your search'}
              </p>
            </div>
          )}
        </>
      ) : (
        <GalleryEmpty />
      )}
    </div>
  );
}

function MuseumIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
      />
    </svg>
  );
}

function SearchEmptyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
      />
    </svg>
  );
}

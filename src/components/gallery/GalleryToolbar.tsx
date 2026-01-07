import { useTranslation } from 'react-i18next';

export type SortOption = 'newest' | 'oldest' | 'name';

interface GalleryToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultCount: number;
}

export function GalleryToolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  resultCount,
}: GalleryToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      {/* Search */}
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ancient-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('gallery.search')}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-ancient-800 border border-ancient-700 text-ancient-100 placeholder:text-ancient-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
        />
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="px-3 py-2.5 rounded-lg bg-ancient-800 border border-ancient-700 text-ancient-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
        >
          <option value="newest">{t('gallery.sortNewest')}</option>
          <option value="oldest">{t('gallery.sortOldest')}</option>
          <option value="name">{t('gallery.sortName')}</option>
        </select>
      </div>

      {/* Result count (mobile: below, desktop: inline) */}
      <div className="flex items-center sm:hidden">
        <span className="text-sm text-ancient-500">
          {resultCount} {resultCount === 1 ? 'artifact' : 'artifacts'}
        </span>
      </div>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

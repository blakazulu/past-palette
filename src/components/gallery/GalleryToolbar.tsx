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
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search input */}
      <div className="relative flex-1 group">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-500 group-focus-within:text-gold-500 transition-colors" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('gallery.search')}
          className="input-ancient w-full pl-11 pr-4 py-3 text-base"
        />
        {/* Bottom glow on focus */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
      </div>

      {/* Sort dropdown */}
      <div className="flex items-center gap-3">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="select-ancient text-base min-w-[140px]"
        >
          <option value="newest">{t('gallery.sortNewest')}</option>
          <option value="oldest">{t('gallery.sortOldest')}</option>
          <option value="name">{t('gallery.sortName')}</option>
        </select>

        {/* Result count badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-obsidian-800/50 border border-obsidian-700/50">
          <span className="text-base text-obsidian-400">
            {resultCount}
          </span>
          <span className="text-sm text-obsidian-500 font-display tracking-wider uppercase">
            {t('gallery.itemCount', { count: resultCount })}
          </span>
        </div>
      </div>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

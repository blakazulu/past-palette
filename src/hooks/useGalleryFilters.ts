import { useState, useMemo } from 'react';
import type { Artifact } from '@/types/artifact';
import type { SortOption } from '@/components/gallery';

interface UseGalleryFiltersReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  filteredArtifacts: Artifact[];
}

export function useGalleryFilters(artifacts: Artifact[]): UseGalleryFiltersReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const filteredArtifacts = useMemo(() => {
    let result = [...artifacts];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((artifact) => {
        const name = artifact.metadata.name?.toLowerCase() || '';
        const location = artifact.metadata.discoveryLocation?.toLowerCase() || '';
        const site = artifact.metadata.siteName?.toLowerCase() || '';
        const tags = artifact.metadata.tags?.join(' ').toLowerCase() || '';
        const notes = artifact.metadata.notes?.toLowerCase() || '';

        return (
          name.includes(query) ||
          location.includes(query) ||
          site.includes(query) ||
          tags.includes(query) ||
          notes.includes(query)
        );
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          const nameA = a.metadata.name || '';
          const nameB = b.metadata.name || '';
          return nameA.localeCompare(nameB);
        default:
          return 0;
      }
    });

    return result;
  }, [artifacts, searchQuery, sortBy]);

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filteredArtifacts,
  };
}

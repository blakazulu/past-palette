import { ArtifactCard } from './ArtifactCard';
import type { Artifact } from '@/types/artifact';

interface GalleryGridProps {
  artifacts: Artifact[];
}

export function GalleryGrid({ artifacts }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {artifacts.map((artifact) => (
        <ArtifactCard key={artifact.id} artifact={artifact} />
      ))}
    </div>
  );
}

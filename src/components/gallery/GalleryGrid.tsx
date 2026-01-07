import { ArtifactCard } from './ArtifactCard';
import type { Artifact } from '@/types/artifact';

interface GalleryGridProps {
  artifacts: Artifact[];
}

export function GalleryGrid({ artifacts }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
      {artifacts.map((artifact, index) => (
        <ArtifactCard key={artifact.id} artifact={artifact} index={index} />
      ))}
    </div>
  );
}

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Artifact, ArtifactImage, ColorVariant } from '@/types/artifact';

interface UseArtifactDataReturn {
  artifact: Artifact | undefined;
  images: ArtifactImage[];
  variants: ColorVariant[];
  variantsLoaded: boolean;
  primaryImage: ArtifactImage | undefined;
  isLoading: boolean;
}

export function useArtifactData(artifactId: string | undefined): UseArtifactDataReturn {
  // Live query for artifact
  const artifact = useLiveQuery(
    () => (artifactId ? db.artifacts.get(artifactId) : undefined),
    [artifactId]
  );

  // Live query for images
  const images = useLiveQuery(
    () =>
      artifactId
        ? db.images.where('artifactId').equals(artifactId).toArray()
        : [],
    [artifactId]
  ) || [];

  // Live query for variants
  const variantsQuery = useLiveQuery(
    () =>
      artifactId
        ? db.colorVariants.where('artifactId').equals(artifactId).toArray()
        : [],
    [artifactId]
  );
  const variants = variantsQuery || [];
  const variantsLoaded = variantsQuery !== undefined;

  // Get primary image (first one)
  const primaryImage = images[0];

  // isLoading is true when artifact is undefined but we're waiting for the query
  const isLoading = artifactId !== undefined && artifact === undefined;

  return {
    artifact,
    images,
    variants,
    variantsLoaded,
    primaryImage,
    isLoading,
  };
}

/**
 * Hook to delete a color variant
 */
export function useDeleteVariant() {
  return async (variantId: string, artifactId: string) => {
    // Delete the variant
    await db.colorVariants.delete(variantId);

    // Update artifact's colorVariantIds
    await db.artifacts.where('id').equals(artifactId).modify((artifact) => {
      artifact.colorVariantIds = artifact.colorVariantIds.filter((id) => id !== variantId);
      artifact.updatedAt = new Date();
    });
  };
}

/**
 * Hook to delete an artifact and all its data
 */
export function useDeleteArtifact() {
  return async (artifactId: string) => {
    // Delete all variants
    await db.colorVariants.where('artifactId').equals(artifactId).delete();

    // Delete all images
    await db.images.where('artifactId').equals(artifactId).delete();

    // Delete the artifact
    await db.artifacts.delete(artifactId);
  };
}

/**
 * Hook to update artifact name
 */
export function useUpdateArtifactName() {
  return async (artifactId: string, name: string) => {
    await db.artifacts.where('id').equals(artifactId).modify((artifact) => {
      artifact.metadata.name = name || undefined;
      artifact.updatedAt = new Date();
    });
  };
}

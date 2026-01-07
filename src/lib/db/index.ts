import Dexie, { Table } from 'dexie';
import type { Artifact, ArtifactImage, ColorVariant } from '@/types/artifact';

export class PastPaletteDB extends Dexie {
  artifacts!: Table<Artifact>;
  images!: Table<ArtifactImage>;
  colorVariants!: Table<ColorVariant>;

  constructor() {
    super('PastPaletteDB');
    this.version(1).stores({
      artifacts: 'id, createdAt, updatedAt, status',
      images: 'id, artifactId, createdAt',
      colorVariants: 'id, artifactId, colorScheme, createdAt',
    });
  }
}

export const db = new PastPaletteDB();

// Helper functions for common operations
export async function getArtifactWithImages(artifactId: string) {
  const artifact = await db.artifacts.get(artifactId);
  if (!artifact) return null;

  const images = await db.images.where('artifactId').equals(artifactId).toArray();
  const variants = await db.colorVariants.where('artifactId').equals(artifactId).toArray();

  return { artifact, images, variants };
}

export async function deleteArtifact(artifactId: string) {
  await db.transaction('rw', [db.artifacts, db.images, db.colorVariants], async () => {
    await db.colorVariants.where('artifactId').equals(artifactId).delete();
    await db.images.where('artifactId').equals(artifactId).delete();
    await db.artifacts.delete(artifactId);
  });
}

export async function getAllArtifacts() {
  return db.artifacts.orderBy('createdAt').reverse().toArray();
}

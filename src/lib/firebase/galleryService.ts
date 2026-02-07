import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, getBlob } from 'firebase/storage';
import { firestore, storage } from './config';
import { db } from '@/lib/db';
import { getDeviceId } from '@/lib/utils/deviceId';
import type { GalleryArtifact } from '@/types/gallery';

const GALLERY_COLLECTION = 'gallery_artifacts';

/**
 * Resize a blob to fit within maxDimension and encode as JPEG.
 * Returns the smaller of the original and re-encoded blob to avoid size inflation.
 */
export function resizeAsJpeg(
  blob: Blob,
  maxDimension: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error('Failed to encode image'));
            return;
          }
          // Return the smaller of original vs re-encoded to avoid size inflation
          resolve(result.size < blob.size ? result : blob);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Generate a thumbnail from a blob (400px max dimension, JPEG 0.8 quality)
 */
function generateThumbnail(blob: Blob): Promise<Blob> {
  return resizeAsJpeg(blob, 400, 0.8);
}

/**
 * Optimize an image for upload (1280px max dimension, JPEG 0.8 quality)
 */
function optimizeForUpload(blob: Blob): Promise<Blob> {
  return resizeAsJpeg(blob, 1280, 0.8);
}

/**
 * Upload an artifact with all its variants to the public gallery
 */
export async function uploadToGallery(artifactId: string): Promise<string> {
  // Get artifact with all related data
  const artifact = await db.artifacts.get(artifactId);
  if (!artifact) {
    throw new Error(`Artifact ${artifactId} not found`);
  }

  const images = await db.images.where('artifactId').equals(artifactId).toArray();
  const variants = await db.colorVariants.where('artifactId').equals(artifactId).toArray();

  if (images.length === 0) {
    throw new Error('No images found for artifact');
  }

  if (variants.length === 0) {
    throw new Error('No color variants found for artifact');
  }

  const primaryImage = images[0];

  // Generate and upload thumbnail
  const thumbnail = await generateThumbnail(primaryImage.blob);
  const thumbnailRef = ref(storage, `gallery/thumbnails/${artifactId}.jpg`);
  await uploadBytes(thumbnailRef, thumbnail);
  const thumbnailUrl = await getDownloadURL(thumbnailRef);

  // Upload original image (optimized)
  const optimizedOriginal = await optimizeForUpload(primaryImage.blob);
  const originalRef = ref(storage, `gallery/originals/${artifactId}.jpg`);
  await uploadBytes(originalRef, optimizedOriginal);
  const originalImageUrl = await getDownloadURL(originalRef);

  // Upload all variants
  const uploadedVariants = await Promise.all(
    variants.map(async (variant) => {
      const optimizedVariant = await optimizeForUpload(variant.blob);
      const variantRef = ref(storage, `gallery/variants/${variant.id}.jpg`);
      await uploadBytes(variantRef, optimizedVariant);
      const imageUrl = await getDownloadURL(variantRef);

      const variantData: Record<string, unknown> = {
        id: variant.id,
        imageUrl,
        colorScheme: variant.colorScheme,
      };
      if (variant.prompt) {
        variantData.prompt = variant.prompt;
      }
      return variantData;
    })
  );

  // Create Firestore document (filter out undefined values)
  const galleryDoc: Record<string, unknown> = {
    id: artifactId,
    deviceId: getDeviceId(),
    name: artifact.metadata.name || 'Unnamed Artifact',
    originalImageUrl,
    thumbnailUrl,
    variants: uploadedVariants,
    createdAt: serverTimestamp(),
    status: 'published',
  };

  // Only add optional fields if they have values
  if (artifact.metadata.siteName) {
    galleryDoc.siteName = artifact.metadata.siteName;
  }
  if (artifact.metadata.discoveryLocation) {
    galleryDoc.discoveryLocation = artifact.metadata.discoveryLocation;
  }

  await setDoc(doc(firestore, GALLERY_COLLECTION, artifactId), galleryDoc);

  return artifactId;
}

/**
 * Convert Firebase Storage URL to proxied URL to avoid CORS issues
 */
function proxyImageUrl(url: string): string {
  // Only proxy Firebase Storage URLs
  if (url.includes('firebasestorage.googleapis.com') || url.includes('firebasestorage.app')) {
    return `/.netlify/functions/image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

/**
 * Fetch the latest gallery artifacts
 */
export async function fetchGalleryArtifacts(count = 30): Promise<GalleryArtifact[]> {
  const q = query(
    collection(firestore, GALLERY_COLLECTION),
    where('status', '==', 'published'),
    orderBy('createdAt', 'desc'),
    limit(count)
  );

  const snapshot = await getDocs(q);
  const artifacts = snapshot.docs.map((doc) => doc.data() as GalleryArtifact);

  // Proxy all image URLs to avoid CORS issues
  return artifacts.map((artifact) => ({
    ...artifact,
    originalImageUrl: proxyImageUrl(artifact.originalImageUrl),
    thumbnailUrl: proxyImageUrl(artifact.thumbnailUrl),
    variants: artifact.variants.map((variant) => ({
      ...variant,
      imageUrl: proxyImageUrl(variant.imageUrl),
    })),
  }));
}

/**
 * Download, optimize, and re-upload all gallery images.
 * Works client-side — no service account needed.
 */
export async function optimizeGalleryImages(
  onProgress: (progress: { current: number; total: number }) => void
): Promise<{ optimized: number; skipped: number; failed: number; total: number }> {
  // Query all published gallery artifacts (no limit)
  const q = query(
    collection(firestore, GALLERY_COLLECTION),
    where('status', '==', 'published')
  );
  const snapshot = await getDocs(q);
  const artifacts = snapshot.docs.map((d) => d.data() as GalleryArtifact);

  // Build flat list of storage paths
  const paths: string[] = [];
  for (const artifact of artifacts) {
    paths.push(`gallery/originals/${artifact.id}.jpg`);
    for (const variant of artifact.variants) {
      paths.push(`gallery/variants/${variant.id}.jpg`);
    }
  }

  const total = paths.length;
  let optimized = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < paths.length; i++) {
    try {
      const path = paths[i];
      const storageRef = ref(storage, path);

      const originalBlob = await getBlob(storageRef);
      const optimizedBlob = await resizeAsJpeg(originalBlob, 1280, 0.8);

      // resizeAsJpeg returns the same blob reference if the optimized version is larger
      if (optimizedBlob.size >= originalBlob.size) {
        skipped++;
      } else {
        await uploadBytes(storageRef, optimizedBlob);
        optimized++;
      }
    } catch {
      failed++;
    }

    onProgress({ current: i + 1, total });
  }

  return { optimized, skipped, failed, total };
}

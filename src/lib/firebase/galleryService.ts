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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore, storage } from './config';
import { db } from '@/lib/db';
import { getDeviceId } from '@/lib/utils/deviceId';
import type { GalleryArtifact } from '@/types/gallery';

const GALLERY_COLLECTION = 'gallery_artifacts';

/**
 * Generate a thumbnail from a blob (400px max dimension, JPEG 0.8 quality)
 */
async function generateThumbnail(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const maxSize = 400;
      let { width, height } = img;

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
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
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Failed to generate thumbnail'));
          }
        },
        'image/jpeg',
        0.8
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

  // Upload original image
  const originalRef = ref(storage, `gallery/originals/${artifactId}.jpg`);
  await uploadBytes(originalRef, primaryImage.blob);
  const originalImageUrl = await getDownloadURL(originalRef);

  // Upload all variants
  const uploadedVariants = await Promise.all(
    variants.map(async (variant) => {
      const variantRef = ref(storage, `gallery/variants/${variant.id}.jpg`);
      await uploadBytes(variantRef, variant.blob);
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

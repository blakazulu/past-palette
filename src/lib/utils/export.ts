import type { ColorVariant } from '@/types/artifact';

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a filename for a color variant
 */
export function generateVariantFilename(
  artifactName: string | undefined,
  colorScheme: string,
  date: Date
): string {
  const safeName = (artifactName || 'artifact')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30);

  const timestamp = date.toISOString().slice(0, 10);
  return `${safeName}-${colorScheme}-${timestamp}.jpg`;
}

/**
 * Download a single color variant
 */
export function downloadVariant(
  variant: ColorVariant,
  artifactName?: string
): void {
  const filename = generateVariantFilename(
    artifactName,
    variant.colorScheme,
    variant.createdAt
  );
  downloadBlob(variant.blob, filename);
}

/**
 * Download the original artifact image
 */
export function downloadOriginalImage(
  imageBlob: Blob,
  artifactName?: string
): void {
  const safeName = (artifactName || 'artifact')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30);

  const timestamp = new Date().toISOString().slice(0, 10);
  downloadBlob(imageBlob, `${safeName}-original-${timestamp}.jpg`);
}

/**
 * Share content using Web Share API
 */
export async function shareContent(data: {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}): Promise<boolean> {
  if (!navigator.share) {
    return false;
  }

  try {
    await navigator.share(data);
    return true;
  } catch (error) {
    // User cancelled or share failed
    if (error instanceof Error && error.name === 'AbortError') {
      return false;
    }
    throw error;
  }
}

/**
 * Share a color variant image
 */
export async function shareVariant(
  variant: ColorVariant,
  artifactName?: string
): Promise<boolean> {
  const filename = generateVariantFilename(
    artifactName,
    variant.colorScheme,
    variant.createdAt
  );

  const file = new File([variant.blob], filename, { type: 'image/jpeg' });

  // Check if file sharing is supported
  if (navigator.canShare && !navigator.canShare({ files: [file] })) {
    // Fall back to download
    downloadVariant(variant, artifactName);
    return false;
  }

  return shareContent({
    title: artifactName || 'Colorized Artifact',
    text: `Artifact colorized with ${variant.colorScheme} color scheme`,
    files: [file],
  });
}

/**
 * Download all variants as individual files
 */
export function downloadAllVariants(
  variants: ColorVariant[],
  artifactName?: string
): void {
  // Stagger downloads to avoid browser blocking
  variants.forEach((variant, index) => {
    setTimeout(() => {
      downloadVariant(variant, artifactName);
    }, index * 200);
  });
}

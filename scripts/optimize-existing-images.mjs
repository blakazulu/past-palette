/**
 * Migration script: Optimize existing gallery images in Firebase Storage
 *
 * Resizes images to 1280px max dimension and re-encodes as JPEG at 0.80 quality.
 * Processes gallery/originals/ and gallery/variants/ folders.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json \
 *   FIREBASE_STORAGE_BUCKET=your-bucket.firebasestorage.app \
 *   node scripts/optimize-existing-images.mjs
 *
 * Options:
 *   DRY_RUN=true   Preview changes without uploading
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import sharp from 'sharp';
import { readFileSync } from 'fs';

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 80;
const DRY_RUN = process.env.DRY_RUN === 'true';

// Initialize Firebase Admin
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credentialPath) {
  console.error('Error: GOOGLE_APPLICATION_CREDENTIALS environment variable is required.');
  console.error('Set it to the path of your Firebase service account JSON file.');
  process.exit(1);
}

const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
if (!bucketName) {
  console.error('Error: FIREBASE_STORAGE_BUCKET environment variable is required.');
  console.error('Example: your-project.firebasestorage.app');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(credentialPath, 'utf-8'));

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: bucketName,
});

const bucket = getStorage().bucket();

async function optimizeImage(buffer) {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  const { width, height } = metadata;
  if (!width || !height) {
    throw new Error('Could not read image dimensions');
  }

  let resizeOpts = undefined;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    resizeOpts = {
      width: width > height ? MAX_DIMENSION : undefined,
      height: height >= width ? MAX_DIMENSION : undefined,
      fit: 'inside',
      withoutEnlargement: true,
    };
  }

  let pipeline = image;
  if (resizeOpts) {
    pipeline = pipeline.resize(resizeOpts);
  }

  return pipeline.jpeg({ quality: JPEG_QUALITY }).toBuffer();
}

async function processFolder(prefix) {
  console.log(`\nProcessing folder: ${prefix}`);

  const [files] = await bucket.getFiles({ prefix });
  const imageFiles = files.filter(
    (f) => f.name.endsWith('.jpg') || f.name.endsWith('.jpeg') || f.name.endsWith('.png')
  );

  console.log(`Found ${imageFiles.length} images`);

  let processed = 0;
  let skipped = 0;
  let totalSavedBytes = 0;

  for (const file of imageFiles) {
    try {
      const [buffer] = await file.download();
      const originalSize = buffer.length;

      const optimized = await optimizeImage(buffer);
      const newSize = optimized.length;
      const saved = originalSize - newSize;

      const idx = processed + skipped + 1;
      const pct = ((idx / imageFiles.length) * 100).toFixed(0);
      const sizeBefore = (originalSize / 1024).toFixed(1);
      const sizeAfter = (newSize / 1024).toFixed(1);

      // Skip if optimized version is not smaller
      if (newSize >= originalSize) {
        skipped++;
        console.log(
          `  [${idx}/${imageFiles.length}] ${pct}% | SKIP ${file.name} | ${sizeBefore}KB (would become ${sizeAfter}KB)`
        );
        continue;
      }

      if (!DRY_RUN) {
        await file.save(optimized, {
          contentType: 'image/jpeg',
          metadata: { contentType: 'image/jpeg' },
        });
      }

      totalSavedBytes += saved;
      processed++;

      const savedKb = (saved / 1024).toFixed(1);
      const prefix = DRY_RUN ? 'DRY ' : '';
      console.log(
        `  [${idx}/${imageFiles.length}] ${pct}% | ${prefix}${file.name} | ${sizeBefore}KB → ${sizeAfter}KB (saved ${savedKb}KB)`
      );
    } catch (err) {
      console.error(`  ERROR processing ${file.name}:`, err.message);
    }
  }

  return { processed, skipped, totalSavedBytes, total: imageFiles.length };
}

async function main() {
  console.log('=== Firebase Storage Image Optimization ===');
  if (DRY_RUN) console.log('*** DRY RUN — no files will be modified ***');
  console.log(`Max dimension: ${MAX_DIMENSION}px, JPEG quality: ${JPEG_QUALITY}`);
  console.log(`Bucket: ${bucketName}`);

  const folders = ['gallery/originals/', 'gallery/variants/'];
  let grandProcessed = 0;
  let grandSkipped = 0;
  let grandSaved = 0;
  let grandTotal = 0;

  for (const folder of folders) {
    const { processed, skipped, totalSavedBytes, total } = await processFolder(folder);
    grandProcessed += processed;
    grandSkipped += skipped;
    grandSaved += totalSavedBytes;
    grandTotal += total;
  }

  console.log('\n=== Summary ===');
  if (DRY_RUN) console.log('(DRY RUN — no files were modified)');
  console.log(`Files optimized: ${grandProcessed}/${grandTotal}`);
  console.log(`Files skipped (already optimal): ${grandSkipped}`);
  console.log(`Total savings: ${(grandSaved / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

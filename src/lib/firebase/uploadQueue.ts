import { v4 as uuid } from 'uuid';
import { db } from '@/lib/db';
import { uploadToGallery } from './galleryService';
import { useUploadStore } from '@/stores/uploadStore';
import type { PendingUpload } from '@/types/gallery';

const RETRY_DELAYS = [0, 5000, 15000, 45000, 120000]; // ms
const MAX_ATTEMPTS = 5;
const STARTUP_RETRY_KEY = 'past-palette-last-startup-retry';
const STARTUP_RETRY_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

let isProcessing = false;
let periodicIntervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Add an artifact to the upload queue
 */
export async function enqueueUpload(artifactId: string): Promise<void> {
  // Check if already queued
  const existing = await db.pendingUploads
    .where('artifactId')
    .equals(artifactId)
    .first();

  if (existing) {
    console.log(`[Gallery Upload] Artifact ${artifactId} already in queue`);
    return;
  }

  const upload: PendingUpload = {
    id: uuid(),
    artifactId,
    status: 'pending',
    attempts: 0,
    createdAt: new Date(),
  };

  await db.pendingUploads.add(upload);
  console.log(`[Gallery Upload] Enqueued artifact ${artifactId}`);

  // Process immediately
  processQueue();
}

/**
 * Process pending uploads
 */
export async function processQueue(): Promise<void> {
  if (isProcessing) return;
  if (!navigator.onLine) {
    console.log('[Gallery Upload] Offline, skipping queue processing');
    return;
  }

  isProcessing = true;

  try {
    const pending = await db.pendingUploads
      .where('status')
      .equals('pending')
      .toArray();

    console.log(`[Gallery Upload] Processing queue: ${pending.length} pending uploads`);

    for (const upload of pending) {
      await processUpload(upload);
    }
  } finally {
    isProcessing = false;
  }
}

async function processUpload(upload: PendingUpload): Promise<void> {
  const retryDelay = RETRY_DELAYS[Math.min(upload.attempts, RETRY_DELAYS.length - 1)];

  if (upload.lastAttempt) {
    const timeSinceLastAttempt = Date.now() - upload.lastAttempt.getTime();
    if (timeSinceLastAttempt < retryDelay) {
      return; // Not ready for retry yet
    }
  }

  const { setCurrentUpload } = useUploadStore.getState();

  console.log(`[Gallery Upload] Starting upload for ${upload.artifactId} (attempt ${upload.attempts + 1})`);

  setCurrentUpload({
    artifactId: upload.artifactId,
    status: 'uploading',
  });

  await db.pendingUploads.update(upload.id, {
    status: 'uploading',
    lastAttempt: new Date(),
  });

  try {
    await uploadToGallery(upload.artifactId);

    // Success - remove from queue
    await db.pendingUploads.delete(upload.id);
    console.log(`[Gallery Upload] Successfully uploaded ${upload.artifactId}`);

    setCurrentUpload({
      artifactId: upload.artifactId,
      status: 'success',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const newAttempts = upload.attempts + 1;

    console.error(`[Gallery Upload] Failed to upload ${upload.artifactId}:`, errorMessage);

    if (newAttempts >= MAX_ATTEMPTS) {
      await db.pendingUploads.update(upload.id, {
        status: 'failed',
        attempts: newAttempts,
        error: errorMessage,
      });
      console.log(`[Gallery Upload] Marked ${upload.artifactId} as failed after ${MAX_ATTEMPTS} attempts`);

      setCurrentUpload({
        artifactId: upload.artifactId,
        status: 'error',
        error: errorMessage,
      });
    } else {
      await db.pendingUploads.update(upload.id, {
        status: 'pending',
        attempts: newAttempts,
        error: errorMessage,
      });
      // Clear the uploading status so user isn't confused during retry delay
      setCurrentUpload(null);
    }
  }
}

/**
 * Retry failed uploads on app startup (once per 24 hours)
 */
export async function retryFailedUploadsOnStartup(): Promise<void> {
  const lastRetry = localStorage.getItem(STARTUP_RETRY_KEY);

  if (lastRetry) {
    const lastRetryTime = parseInt(lastRetry, 10);
    if (Date.now() - lastRetryTime < STARTUP_RETRY_INTERVAL_MS) {
      console.log('[Gallery Upload] Skipping startup retry - already retried within 24 hours');
      return;
    }
  }

  const failedUploads = await db.pendingUploads
    .where('status')
    .equals('failed')
    .toArray();

  if (failedUploads.length === 0) {
    console.log('[Gallery Upload] No failed uploads to retry');
    return;
  }

  console.log(`[Gallery Upload] Retrying ${failedUploads.length} failed uploads on startup`);
  localStorage.setItem(STARTUP_RETRY_KEY, Date.now().toString());

  for (const upload of failedUploads) {
    await db.pendingUploads.update(upload.id, {
      status: 'pending',
      attempts: Math.max(0, upload.attempts - 1),
      error: undefined,
    });
  }

  processQueue();
}

/**
 * Initialize the upload queue system
 */
export function initializeUploadQueue(): void {
  // Process queue on startup
  retryFailedUploadsOnStartup();
  processQueue();

  // Process queue when coming online
  window.addEventListener('online', () => {
    console.log('[Gallery Upload] Back online, processing queue...');
    processQueue();
  });

  // Periodic processing every 2 minutes
  if (periodicIntervalId) {
    clearInterval(periodicIntervalId);
  }

  periodicIntervalId = setInterval(() => {
    if (navigator.onLine) {
      processQueue();
    }
  }, 2 * 60 * 1000);

  console.log('[Gallery Upload] Upload queue initialized');
}

/**
 * Cleanup (for testing or app shutdown)
 */
export function cleanupUploadQueue(): void {
  if (periodicIntervalId) {
    clearInterval(periodicIntervalId);
    periodicIntervalId = null;
  }
}

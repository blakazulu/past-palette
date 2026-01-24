# Public Art Gallery Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a public art gallery where colorized artifacts are automatically uploaded to Firebase and displayed in a 3D virtual walkthrough experience.

**Architecture:** Firebase (Firestore + Storage) for cloud data, Dexie queue for offline-first upload retry, React Three Fiber for 3D gallery rendering. Auto-upload triggers on colorization complete, with startup/online/periodic retry mechanisms.

**Tech Stack:** Firebase 11.x, React Three Fiber, Three.js, @react-three/drei

---

## Phase 1: Firebase Setup

### Task 1.1: Install Firebase Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Firebase SDK**

Run:
```bash
npm install firebase
```

Expected: Package added to dependencies

**Step 2: Verify installation**

Run:
```bash
npm ls firebase
```

Expected: Shows firebase@11.x.x

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add Firebase SDK dependency"
```

---

### Task 1.2: Create Firebase Configuration

**Files:**
- Create: `src/lib/firebase/config.ts`

**Step 1: Create the Firebase config file**

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);
export const storage = getStorage(app);
```

**Step 2: Create `.env.local` template**

Create: `src/lib/firebase/.env.example`

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Step 3: Add env types**

Create: `src/vite-env.d.ts` (or append to existing)

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

**Step 4: Commit**

```bash
git add src/lib/firebase/config.ts src/lib/firebase/.env.example src/vite-env.d.ts
git commit -m "Add Firebase configuration"
```

---

### Task 1.3: Create Gallery Types

**Files:**
- Create: `src/types/gallery.ts`

**Step 1: Create the types file**

```typescript
import type { Timestamp } from 'firebase/firestore';
import type { ColorScheme } from './artifact';

export interface GalleryVariant {
  id: string;
  imageUrl: string;
  colorScheme: ColorScheme;
  prompt?: string;
}

export interface GalleryArtifact {
  id: string;
  deviceId: string;
  name: string;
  siteName?: string;
  discoveryLocation?: string;
  originalImageUrl: string;
  thumbnailUrl: string;
  variants: GalleryVariant[];
  createdAt: Timestamp;
  status: 'published' | 'flagged' | 'removed';
}

export interface PendingUpload {
  id: string;
  artifactId: string;
  status: 'pending' | 'uploading' | 'failed';
  attempts: number;
  lastAttempt?: Date;
  error?: string;
  createdAt: Date;
}
```

**Step 2: Export from types index**

Modify: `src/types/index.ts` (create if doesn't exist)

```typescript
export * from './artifact';
export * from './gallery';
```

**Step 3: Commit**

```bash
git add src/types/gallery.ts src/types/index.ts
git commit -m "Add gallery types for Firebase data model"
```

---

## Phase 2: Upload System

### Task 2.1: Add PendingUploads Table to Dexie

**Files:**
- Modify: `src/lib/db/index.ts`

**Step 1: Update the database schema**

```typescript
import Dexie, { Table } from 'dexie';
import type { Artifact, ArtifactImage, ColorVariant } from '@/types/artifact';
import type { PendingUpload } from '@/types/gallery';

export class PastPaletteDB extends Dexie {
  artifacts!: Table<Artifact>;
  images!: Table<ArtifactImage>;
  colorVariants!: Table<ColorVariant>;
  pendingUploads!: Table<PendingUpload>;

  constructor() {
    super('PastPaletteDB');
    this.version(1).stores({
      artifacts: 'id, createdAt, updatedAt, status',
      images: 'id, artifactId, createdAt',
      colorVariants: 'id, artifactId, colorScheme, createdAt',
    });
    this.version(2).stores({
      artifacts: 'id, createdAt, updatedAt, status',
      images: 'id, artifactId, createdAt',
      colorVariants: 'id, artifactId, colorScheme, createdAt',
      pendingUploads: 'id, artifactId, status, createdAt',
    });
  }
}

export const db = new PastPaletteDB();

// ... rest of existing helper functions unchanged
```

**Step 2: Run the app to verify migration**

Run:
```bash
npm run dev
```

Expected: App starts without errors, IndexedDB shows new table in DevTools

**Step 3: Commit**

```bash
git add src/lib/db/index.ts
git commit -m "Add pendingUploads table to Dexie schema"
```

---

### Task 2.2: Create Device ID Utility

**Files:**
- Create: `src/lib/utils/deviceId.ts`

**Step 1: Create the device ID utility**

```typescript
const DEVICE_ID_KEY = 'past-palette-device-id';

export function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}
```

**Step 2: Commit**

```bash
git add src/lib/utils/deviceId.ts
git commit -m "Add device ID utility for upload tracking"
```

---

### Task 2.3: Create Gallery Service

**Files:**
- Create: `src/lib/firebase/galleryService.ts`

**Step 1: Create the gallery service**

```typescript
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

      return {
        id: variant.id,
        imageUrl,
        colorScheme: variant.colorScheme,
        prompt: variant.prompt || undefined,
      };
    })
  );

  // Create Firestore document
  const galleryDoc: Omit<GalleryArtifact, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    id: artifactId,
    deviceId: getDeviceId(),
    name: artifact.metadata.name || 'Unnamed Artifact',
    siteName: artifact.metadata.siteName,
    discoveryLocation: artifact.metadata.discoveryLocation,
    originalImageUrl,
    thumbnailUrl,
    variants: uploadedVariants,
    createdAt: serverTimestamp(),
    status: 'published',
  };

  await setDoc(doc(firestore, GALLERY_COLLECTION, artifactId), galleryDoc);

  return artifactId;
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
  return snapshot.docs.map((doc) => doc.data() as GalleryArtifact);
}
```

**Step 2: Commit**

```bash
git add src/lib/firebase/galleryService.ts
git commit -m "Add gallery service for Firebase uploads"
```

---

### Task 2.4: Create Upload Queue System

**Files:**
- Create: `src/lib/firebase/uploadQueue.ts`

**Step 1: Create the upload queue**

```typescript
import { v4 as uuid } from 'uuid';
import { db } from '@/lib/db';
import { uploadToGallery } from './galleryService';
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

  console.log(`[Gallery Upload] Starting upload for ${upload.artifactId} (attempt ${upload.attempts + 1})`);

  await db.pendingUploads.update(upload.id, {
    status: 'uploading',
    lastAttempt: new Date(),
  });

  try {
    await uploadToGallery(upload.artifactId);

    // Success - remove from queue
    await db.pendingUploads.delete(upload.id);
    console.log(`[Gallery Upload] Successfully uploaded ${upload.artifactId}`);
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
    } else {
      await db.pendingUploads.update(upload.id, {
        status: 'pending',
        attempts: newAttempts,
        error: errorMessage,
      });
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
```

**Step 2: Commit**

```bash
git add src/lib/firebase/uploadQueue.ts
git commit -m "Add upload queue with retry logic"
```

---

### Task 2.5: Initialize Upload Queue on App Startup

**Files:**
- Modify: `src/App.tsx`

**Step 1: Add queue initialization**

```typescript
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores/appStore';
import { Layout } from '@/components/layout';
import { ErrorBoundary } from '@/components/ui';
import { initializeUploadQueue } from '@/lib/firebase/uploadQueue';
import {
  HomePage,
  CapturePage,
  GalleryPage,
  ArtifactDetailPage,
  SettingsPage,
} from '@/pages';

function App() {
  const { i18n } = useTranslation();
  const { language } = useSettingsStore();

  // Initialize upload queue on mount
  useEffect(() => {
    initializeUploadQueue();
  }, []);

  // Sync language with settings store on mount
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="capture" element={<CapturePage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="artifact/:id" element={<ArtifactDetailPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
```

**Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "Initialize upload queue on app startup"
```

---

### Task 2.6: Trigger Upload on Colorization Complete

**Files:**
- Modify: `src/hooks/useColorize.ts`

**Step 1: Add upload queue trigger**

After line 138 (after updating artifact status), add:

```typescript
// Queue for gallery upload
import { enqueueUpload } from '@/lib/firebase/uploadQueue';

// ... inside the colorize function, after saving to IndexedDB:

// Queue for gallery upload (fire-and-forget)
enqueueUpload(artifactId).catch((err) => {
  console.error('[Gallery Upload] Failed to enqueue:', err);
});
```

The full modified section (lines 127-144):

```typescript
        // Save to IndexedDB
        await db.colorVariants.add(newVariant);

        // Update artifact's colorVariantIds
        await db.artifacts.where('id').equals(artifactId).modify((artifact) => {
          artifact.colorVariantIds = [...artifact.colorVariantIds, newVariant.id];
          artifact.updatedAt = new Date();
          if (artifact.status === 'images-captured') {
            artifact.status = 'complete';
          }
        });

        // Queue for gallery upload (fire-and-forget)
        enqueueUpload(artifactId).catch((err) => {
          console.error('[Gallery Upload] Failed to enqueue:', err);
        });

        setProgress(100);
        setStep('complete');
        setVariant(newVariant);
```

**Step 2: Commit**

```bash
git add src/hooks/useColorize.ts
git commit -m "Trigger gallery upload on colorization complete"
```

---

## Phase 3: Public Gallery Page (2D)

### Task 3.1: Create Public Gallery Page

**Files:**
- Create: `src/pages/PublicGalleryPage.tsx`

**Step 1: Create the page component**

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchGalleryArtifacts } from '@/lib/firebase/galleryService';
import type { GalleryArtifact } from '@/types/gallery';

export function PublicGalleryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [artifacts, setArtifacts] = useState<GalleryArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArtifacts() {
      try {
        setLoading(true);
        const data = await fetchGalleryArtifacts(30);
        setArtifacts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load gallery');
      } finally {
        setLoading(false);
      }
    }

    loadArtifacts();
  }, []);

  const handleEnterTour = () => {
    navigate('/gallery-tour');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-accent-600 hover:bg-accent-500 rounded-lg transition-colors"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-ancient-100">
          {t('publicGallery.title', 'Public Gallery')}
        </h1>
        <p className="text-ancient-400">
          {t('publicGallery.subtitle', '{{count}} colorized artifacts from the community', { count: artifacts.length })}
        </p>
      </div>

      {/* Enter 3D Tour Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleEnterTour}
          disabled={artifacts.length === 0}
          className="px-6 py-3 bg-gold-600 hover:bg-gold-500 disabled:bg-ancient-700 disabled:text-ancient-500 text-ancient-900 font-semibold rounded-xl transition-colors flex items-center gap-2"
        >
          <span>🎨</span>
          {t('publicGallery.enterTour', 'Enter Virtual Gallery')}
        </button>
      </div>

      {/* Grid */}
      {artifacts.length === 0 ? (
        <div className="text-center py-12 text-ancient-400">
          {t('publicGallery.empty', 'No artifacts yet. Be the first to share!')}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {artifacts.map((artifact) => (
            <div
              key={artifact.id}
              className="aspect-square rounded-xl overflow-hidden bg-ancient-800 relative group"
            >
              <img
                src={artifact.thumbnailUrl}
                alt={artifact.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-medium text-sm truncate">
                    {artifact.name}
                  </p>
                  <p className="text-ancient-300 text-xs">
                    {artifact.variants.length} {t('publicGallery.variants', 'variants')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Export from pages index**

Modify: `src/pages/index.ts`

```typescript
export { HomePage } from './HomePage';
export { CapturePage } from './CapturePage';
export { GalleryPage } from './GalleryPage';
export { ArtifactDetailPage } from './ArtifactDetailPage';
export { SettingsPage } from './SettingsPage';
export { PublicGalleryPage } from './PublicGalleryPage';
```

**Step 3: Add route to App.tsx**

Add import and route:

```typescript
import {
  HomePage,
  CapturePage,
  GalleryPage,
  ArtifactDetailPage,
  SettingsPage,
  PublicGalleryPage,
} from '@/pages';

// In routes:
<Route path="public-gallery" element={<PublicGalleryPage />} />
```

**Step 4: Add translations**

Add to `src/i18n/locales/en.json`:

```json
{
  "publicGallery": {
    "title": "Public Gallery",
    "subtitle": "{{count}} colorized artifacts from the community",
    "enterTour": "Enter Virtual Gallery",
    "empty": "No artifacts yet. Be the first to share!",
    "variants": "variants"
  }
}
```

Add to `src/i18n/locales/he.json`:

```json
{
  "publicGallery": {
    "title": "גלריה ציבורית",
    "subtitle": "{{count}} ממצאים צבועים מהקהילה",
    "enterTour": "כניסה לגלריה הווירטואלית",
    "empty": "אין עדיין ממצאים. היו הראשונים לשתף!",
    "variants": "גרסאות"
  }
}
```

**Step 5: Commit**

```bash
git add src/pages/PublicGalleryPage.tsx src/pages/index.ts src/App.tsx src/i18n/locales/en.json src/i18n/locales/he.json
git commit -m "Add public gallery page with 2D grid view"
```

---

## Phase 4: 3D Virtual Gallery

### Task 4.1: Install Three.js Dependencies

**Step 1: Install packages**

Run:
```bash
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

**Step 2: Verify installation**

Run:
```bash
npm ls three @react-three/fiber @react-three/drei
```

Expected: All packages listed

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add Three.js and React Three Fiber dependencies"
```

---

### Task 4.2: Create Gallery Room Component

**Files:**
- Create: `src/components/gallery-tour/GalleryRoom.tsx`

**Step 1: Create the 3D room environment**

```typescript
import { useMemo } from 'react';
import * as THREE from 'three';

const ROOM_WIDTH = 24;
const ROOM_DEPTH = 20;
const ROOM_HEIGHT = 4;
const WALL_THICKNESS = 0.2;

export function GalleryRoom() {
  const floorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#8B7355', // Warm wood
        roughness: 0.8,
      }),
    []
  );

  const wallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#F5F5DC', // Light neutral
        roughness: 0.9,
      }),
    []
  );

  const ceilingMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#FFFFF0',
        roughness: 0.95,
      }),
    []
  );

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <primitive object={ceilingMaterial} attach="material" />
      </mesh>

      {/* North Wall (back) */}
      <mesh position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]} receiveShadow>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, WALL_THICKNESS]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      {/* South Wall (front with entrance gap) */}
      <mesh position={[-ROOM_WIDTH / 4 - 1, ROOM_HEIGHT / 2, ROOM_DEPTH / 2]} receiveShadow>
        <boxGeometry args={[ROOM_WIDTH / 2 - 2, ROOM_HEIGHT, WALL_THICKNESS]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>
      <mesh position={[ROOM_WIDTH / 4 + 1, ROOM_HEIGHT / 2, ROOM_DEPTH / 2]} receiveShadow>
        <boxGeometry args={[ROOM_WIDTH / 2 - 2, ROOM_HEIGHT, WALL_THICKNESS]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      {/* East Wall (right) */}
      <mesh position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[ROOM_DEPTH, ROOM_HEIGHT, WALL_THICKNESS]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      {/* West Wall (left) */}
      <mesh position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[ROOM_DEPTH, ROOM_HEIGHT, WALL_THICKNESS]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      {/* Ambient lighting */}
      <ambientLight intensity={0.4} color="#FFF8DC" />

      {/* Main directional light */}
      <directionalLight
        position={[5, ROOM_HEIGHT - 0.5, 5]}
        intensity={0.6}
        color="#FFFFFF"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Fill light */}
      <directionalLight
        position={[-5, ROOM_HEIGHT - 0.5, -5]}
        intensity={0.3}
        color="#E6E6FA"
      />

      {/* Fog for depth */}
      <fog attach="fog" args={['#1a1a2e', 20, 50]} />
    </group>
  );
}

export const GALLERY_BOUNDS = {
  minX: -ROOM_WIDTH / 2 + 0.5,
  maxX: ROOM_WIDTH / 2 - 0.5,
  minZ: -ROOM_DEPTH / 2 + 0.5,
  maxZ: ROOM_DEPTH / 2 - 0.5,
};
```

**Step 2: Create index export**

Create: `src/components/gallery-tour/index.ts`

```typescript
export { GalleryRoom, GALLERY_BOUNDS } from './GalleryRoom';
```

**Step 3: Commit**

```bash
git add src/components/gallery-tour/GalleryRoom.tsx src/components/gallery-tour/index.ts
git commit -m "Add 3D gallery room component"
```

---

### Task 4.3: Create Artwork Frame Component

**Files:**
- Create: `src/components/gallery-tour/ArtworkFrame.tsx`

**Step 1: Create the frame component**

```typescript
import { useRef, useState, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import type { GalleryArtifact } from '@/types/gallery';

interface ArtworkFrameProps {
  artifact: GalleryArtifact;
  position: [number, number, number];
  rotation: [number, number, number];
  isNearby: boolean;
  onClick: () => void;
}

const FRAME_WIDTH = 1.2;
const FRAME_HEIGHT = 1.0;
const FRAME_DEPTH = 0.08;
const BORDER_WIDTH = 0.06;

export function ArtworkFrame({
  artifact,
  position,
  rotation,
  isNearby,
  onClick,
}: ArtworkFrameProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Load texture from first variant
  useEffect(() => {
    if (artifact.variants.length > 0) {
      const loader = new THREE.TextureLoader();
      loader.load(
        artifact.variants[0].imageUrl,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          setTexture(tex);
        },
        undefined,
        (err) => console.error('Failed to load texture:', err)
      );
    }

    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [artifact.variants]);

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: isNearby ? '#D4AF37' : '#8B4513', // Gold when nearby, wood otherwise
    roughness: 0.3,
    metalness: isNearby ? 0.6 : 0.1,
  });

  const canvasMaterial = texture
    ? new THREE.MeshBasicMaterial({ map: texture })
    : new THREE.MeshBasicMaterial({ color: '#333333' });

  return (
    <group ref={groupRef} position={position} rotation={rotation} onClick={onClick}>
      {/* Frame border */}
      <mesh castShadow>
        <boxGeometry args={[FRAME_WIDTH + BORDER_WIDTH * 2, FRAME_HEIGHT + BORDER_WIDTH * 2, FRAME_DEPTH]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>

      {/* Canvas/artwork */}
      <mesh position={[0, 0, FRAME_DEPTH / 2 + 0.001]}>
        <planeGeometry args={[FRAME_WIDTH, FRAME_HEIGHT]} />
        <primitive object={canvasMaterial} attach="material" />
      </mesh>

      {/* Spotlight above frame */}
      <spotLight
        position={[0, 0.8, 0.5]}
        angle={0.4}
        penumbra={0.5}
        intensity={isNearby ? 2 : 1}
        color="#FFF8DC"
        target-position={[0, 0, 0]}
        castShadow={false}
      />

      {/* Name plaque */}
      {isNearby && (
        <mesh position={[0, -(FRAME_HEIGHT / 2 + 0.15), 0.05]}>
          <planeGeometry args={[0.8, 0.12]} />
          <meshBasicMaterial color="#1a1a2e" />
        </mesh>
      )}
    </group>
  );
}
```

**Step 2: Update index export**

```typescript
export { GalleryRoom, GALLERY_BOUNDS } from './GalleryRoom';
export { ArtworkFrame } from './ArtworkFrame';
```

**Step 3: Commit**

```bash
git add src/components/gallery-tour/ArtworkFrame.tsx src/components/gallery-tour/index.ts
git commit -m "Add artwork frame component with texture loading"
```

---

### Task 4.4: Create First Person Controls

**Files:**
- Create: `src/components/gallery-tour/FirstPersonControls.tsx`

**Step 1: Create controls component**

```typescript
import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GALLERY_BOUNDS } from './GalleryRoom';

const MOVE_SPEED = 4;
const SPRINT_MULTIPLIER = 2;
const LOOK_SENSITIVITY = 0.002;
const PLAYER_HEIGHT = 1.7;

interface FirstPersonControlsProps {
  enabled: boolean;
}

export function FirstPersonControls({ enabled }: FirstPersonControlsProps) {
  const { camera, gl } = useThree();
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  });
  const isLocked = useRef(false);
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          moveState.current.sprint = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          moveState.current.sprint = false;
          break;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isLocked.current) return;

      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= e.movementX * LOOK_SENSITIVITY;
      euler.current.x -= e.movementY * LOOK_SENSITIVITY;
      euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    };

    const handleClick = () => {
      gl.domElement.requestPointerLock();
    };

    const handlePointerLockChange = () => {
      isLocked.current = document.pointerLockElement === gl.domElement;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [enabled, camera, gl]);

  useFrame((_, delta) => {
    if (!enabled) return;

    const speed = MOVE_SPEED * (moveState.current.sprint ? SPRINT_MULTIPLIER : 1) * delta;
    const direction = new THREE.Vector3();

    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(direction, camera.up).normalize();

    const newPosition = camera.position.clone();

    if (moveState.current.forward) newPosition.addScaledVector(direction, speed);
    if (moveState.current.backward) newPosition.addScaledVector(direction, -speed);
    if (moveState.current.left) newPosition.addScaledVector(right, -speed);
    if (moveState.current.right) newPosition.addScaledVector(right, speed);

    // Clamp to bounds
    newPosition.x = Math.max(GALLERY_BOUNDS.minX, Math.min(GALLERY_BOUNDS.maxX, newPosition.x));
    newPosition.z = Math.max(GALLERY_BOUNDS.minZ, Math.min(GALLERY_BOUNDS.maxZ, newPosition.z));
    newPosition.y = PLAYER_HEIGHT;

    camera.position.copy(newPosition);
  });

  return null;
}
```

**Step 2: Update index export**

```typescript
export { GalleryRoom, GALLERY_BOUNDS } from './GalleryRoom';
export { ArtworkFrame } from './ArtworkFrame';
export { FirstPersonControls } from './FirstPersonControls';
```

**Step 3: Commit**

```bash
git add src/components/gallery-tour/FirstPersonControls.tsx src/components/gallery-tour/index.ts
git commit -m "Add first person controls for desktop"
```

---

### Task 4.5: Create Touch Controls for Mobile

**Files:**
- Create: `src/components/gallery-tour/TouchControls.tsx`

**Step 1: Create mobile touch controls**

```typescript
import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GALLERY_BOUNDS } from './GalleryRoom';

const MOVE_SPEED = 4;
const LOOK_SENSITIVITY = 0.003;
const PLAYER_HEIGHT = 1.7;
const JOYSTICK_SIZE = 120;

interface TouchControlsProps {
  enabled: boolean;
}

export function TouchControls({ enabled }: TouchControlsProps) {
  const { camera } = useThree();
  const moveVector = useRef({ x: 0, y: 0 });
  const lookDelta = useRef({ x: 0, y: 0 });
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const joystickTouchId = useRef<number | null>(null);
  const lookTouchId = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    for (const touch of Array.from(e.changedTouches)) {
      const x = touch.clientX;
      const screenWidth = window.innerWidth;

      // Left side = joystick
      if (x < screenWidth / 2 && joystickTouchId.current === null) {
        joystickTouchId.current = touch.identifier;
      }
      // Right side = look
      else if (x >= screenWidth / 2 && lookTouchId.current === null) {
        lookTouchId.current = touch.identifier;
      }
    }
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    for (const touch of Array.from(e.changedTouches)) {
      if (touch.identifier === joystickTouchId.current) {
        // Calculate joystick offset from initial touch
        const maxOffset = JOYSTICK_SIZE / 2;
        moveVector.current.x = Math.max(-1, Math.min(1, (touch.clientX - window.innerWidth / 4) / maxOffset));
        moveVector.current.y = Math.max(-1, Math.min(1, (touch.clientY - window.innerHeight / 2) / maxOffset));
      }

      if (touch.identifier === lookTouchId.current) {
        lookDelta.current.x = -touch.clientX * LOOK_SENSITIVITY;
        lookDelta.current.y = -touch.clientY * LOOK_SENSITIVITY;
      }
    }
  }, [enabled]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    for (const touch of Array.from(e.changedTouches)) {
      if (touch.identifier === joystickTouchId.current) {
        joystickTouchId.current = null;
        moveVector.current = { x: 0, y: 0 };
      }
      if (touch.identifier === lookTouchId.current) {
        lookTouchId.current = null;
        lookDelta.current = { x: 0, y: 0 };
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  useFrame((_, delta) => {
    if (!enabled) return;

    // Look
    if (lookDelta.current.x !== 0 || lookDelta.current.y !== 0) {
      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y += lookDelta.current.x * delta;
      euler.current.x += lookDelta.current.y * delta;
      euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    }

    // Move
    const speed = MOVE_SPEED * delta;
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(direction, camera.up).normalize();

    const newPosition = camera.position.clone();

    newPosition.addScaledVector(direction, -moveVector.current.y * speed);
    newPosition.addScaledVector(right, moveVector.current.x * speed);

    // Clamp to bounds
    newPosition.x = Math.max(GALLERY_BOUNDS.minX, Math.min(GALLERY_BOUNDS.maxX, newPosition.x));
    newPosition.z = Math.max(GALLERY_BOUNDS.minZ, Math.min(GALLERY_BOUNDS.maxZ, newPosition.z));
    newPosition.y = PLAYER_HEIGHT;

    camera.position.copy(newPosition);
  });

  return null;
}
```

**Step 2: Update index export**

```typescript
export { GalleryRoom, GALLERY_BOUNDS } from './GalleryRoom';
export { ArtworkFrame } from './ArtworkFrame';
export { FirstPersonControls } from './FirstPersonControls';
export { TouchControls } from './TouchControls';
```

**Step 3: Commit**

```bash
git add src/components/gallery-tour/TouchControls.tsx src/components/gallery-tour/index.ts
git commit -m "Add touch controls for mobile"
```

---

### Task 4.6: Create Artwork Info Overlay

**Files:**
- Create: `src/components/gallery-tour/ArtworkInfoOverlay.tsx`

**Step 1: Create the overlay component**

```typescript
import { useTranslation } from 'react-i18next';
import type { GalleryArtifact } from '@/types/gallery';

interface ArtworkInfoOverlayProps {
  artifact: GalleryArtifact | null;
  currentVariantIndex: number;
  onChangeVariant: (index: number) => void;
  onClose: () => void;
}

export function ArtworkInfoOverlay({
  artifact,
  currentVariantIndex,
  onChangeVariant,
  onClose,
}: ArtworkInfoOverlayProps) {
  const { t } = useTranslation();

  if (!artifact) return null;

  const currentVariant = artifact.variants[currentVariantIndex];

  return (
    <div className="absolute bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-ancient-900/95 backdrop-blur-sm rounded-xl p-4 border border-ancient-700">
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 text-ancient-400 hover:text-ancient-200"
      >
        ✕
      </button>

      {/* Artifact name */}
      <h3 className="text-lg font-semibold text-ancient-100 mb-1 pr-6">
        {artifact.name}
      </h3>

      {artifact.siteName && (
        <p className="text-sm text-ancient-400 mb-3">{artifact.siteName}</p>
      )}

      {/* Current scheme */}
      <div className="mb-3">
        <span className="text-xs text-ancient-500 uppercase tracking-wide">
          {t('gallery.colorScheme', 'Color Scheme')}
        </span>
        <p className="text-ancient-200 capitalize">
          {currentVariant?.colorScheme || 'Unknown'}
        </p>
      </div>

      {/* Variant thumbnails */}
      {artifact.variants.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {artifact.variants.map((variant, index) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => onChangeVariant(index)}
              className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentVariantIndex
                  ? 'border-gold-500'
                  : 'border-transparent hover:border-ancient-600'
              }`}
            >
              <img
                src={variant.imageUrl}
                alt={variant.colorScheme}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Update index export**

```typescript
export { GalleryRoom, GALLERY_BOUNDS } from './GalleryRoom';
export { ArtworkFrame } from './ArtworkFrame';
export { FirstPersonControls } from './FirstPersonControls';
export { TouchControls } from './TouchControls';
export { ArtworkInfoOverlay } from './ArtworkInfoOverlay';
```

**Step 3: Commit**

```bash
git add src/components/gallery-tour/ArtworkInfoOverlay.tsx src/components/gallery-tour/index.ts
git commit -m "Add artwork info overlay component"
```

---

### Task 4.7: Create Gallery Tour Page

**Files:**
- Create: `src/pages/GalleryTourPage.tsx`

**Step 1: Create the main tour page**

```typescript
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { useTranslation } from 'react-i18next';
import {
  GalleryRoom,
  ArtworkFrame,
  FirstPersonControls,
  TouchControls,
  ArtworkInfoOverlay,
} from '@/components/gallery-tour';
import { fetchGalleryArtifacts } from '@/lib/firebase/galleryService';
import type { GalleryArtifact } from '@/types/gallery';

// Frame positions around the room walls
const FRAME_POSITIONS: Array<{
  position: [number, number, number];
  rotation: [number, number, number];
}> = [
  // North wall (8 frames)
  ...Array.from({ length: 8 }, (_, i) => ({
    position: [-10.5 + i * 3, 1.6, -9.8] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
  })),
  // South wall (8 frames)
  ...Array.from({ length: 8 }, (_, i) => ({
    position: [-10.5 + i * 3, 1.6, 9.8] as [number, number, number],
    rotation: [0, Math.PI, 0] as [number, number, number],
  })),
  // West wall (7 frames)
  ...Array.from({ length: 7 }, (_, i) => ({
    position: [-11.8, 1.6, -7 + i * 2.5] as [number, number, number],
    rotation: [0, Math.PI / 2, 0] as [number, number, number],
  })),
  // East wall (7 frames)
  ...Array.from({ length: 7 }, (_, i) => ({
    position: [11.8, 1.6, -7 + i * 2.5] as [number, number, number],
    rotation: [0, -Math.PI / 2, 0] as [number, number, number],
  })),
];

const PROXIMITY_THRESHOLD = 2.5;

export function GalleryTourPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [artifacts, setArtifacts] = useState<GalleryArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [nearbyArtifact, setNearbyArtifact] = useState<GalleryArtifact | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  const isMobile = useMemo(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent), []);

  // Check WebGL support
  const hasWebGL = useMemo(() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    async function loadArtifacts() {
      try {
        const data = await fetchGalleryArtifacts(30);
        // Shuffle for discovery
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setArtifacts(shuffled);
      } catch (err) {
        console.error('Failed to load artifacts:', err);
      } finally {
        setLoading(false);
      }
    }

    loadArtifacts();
  }, []);

  const handleFrameClick = useCallback((artifact: GalleryArtifact) => {
    setNearbyArtifact(artifact);
    setSelectedVariantIndex(0);
  }, []);

  const handleExit = () => {
    document.exitPointerLock();
    navigate('/public-gallery');
  };

  // Fallback for no WebGL
  if (!hasWebGL) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <p className="text-ancient-300 mb-4">
          {t('galleryTour.noWebGL', 'Your browser does not support 3D graphics.')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/public-gallery')}
          className="px-4 py-2 bg-accent-600 hover:bg-accent-500 rounded-lg"
        >
          {t('galleryTour.viewGrid', 'View Grid Gallery')}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-500" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1.7, 8], fov: 75 }}
        shadows={!isMobile}
        dpr={isMobile ? [1, 1] : [1, 2]}
        gl={{ antialias: !isMobile }}
      >
        <GalleryRoom />

        {artifacts.map((artifact, index) => {
          if (index >= FRAME_POSITIONS.length) return null;
          const { position, rotation } = FRAME_POSITIONS[index];

          return (
            <ArtworkFrame
              key={artifact.id}
              artifact={artifact}
              position={position}
              rotation={rotation}
              isNearby={nearbyArtifact?.id === artifact.id}
              onClick={() => handleFrameClick(artifact)}
            />
          );
        })}

        {isMobile ? (
          <TouchControls enabled={!showInstructions} />
        ) : (
          <FirstPersonControls enabled={!showInstructions} />
        )}
      </Canvas>

      {/* Instructions overlay */}
      {showInstructions && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-ancient-900 rounded-xl p-6 max-w-md text-center">
            <h2 className="text-xl font-bold text-ancient-100 mb-4">
              {t('galleryTour.welcome', 'Welcome to the Gallery')}
            </h2>
            <div className="text-ancient-300 text-sm space-y-2 mb-6">
              {isMobile ? (
                <>
                  <p>{t('galleryTour.mobileMove', 'Use left side to move')}</p>
                  <p>{t('galleryTour.mobileLook', 'Drag right side to look around')}</p>
                  <p>{t('galleryTour.mobileTap', 'Tap artwork to see details')}</p>
                </>
              ) : (
                <>
                  <p>{t('galleryTour.desktopMove', 'WASD or Arrow keys to move')}</p>
                  <p>{t('galleryTour.desktopLook', 'Mouse to look around')}</p>
                  <p>{t('galleryTour.desktopSprint', 'Hold Shift to sprint')}</p>
                  <p>{t('galleryTour.desktopClick', 'Click to enable controls')}</p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowInstructions(false)}
              className="px-6 py-3 bg-gold-600 hover:bg-gold-500 text-ancient-900 font-semibold rounded-xl"
            >
              {t('galleryTour.enter', 'Enter Gallery')}
            </button>
          </div>
        </div>
      )}

      {/* Artwork info overlay */}
      {!showInstructions && (
        <ArtworkInfoOverlay
          artifact={nearbyArtifact}
          currentVariantIndex={selectedVariantIndex}
          onChangeVariant={setSelectedVariantIndex}
          onClose={() => setNearbyArtifact(null)}
        />
      )}

      {/* Exit button */}
      {!showInstructions && (
        <button
          type="button"
          onClick={handleExit}
          className="absolute top-4 right-4 px-4 py-2 bg-ancient-800/80 hover:bg-ancient-700 text-ancient-200 rounded-lg backdrop-blur-sm"
        >
          {t('common.exit', 'Exit')}
        </button>
      )}

      {/* Artifact counter */}
      {!showInstructions && (
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-ancient-800/80 text-ancient-300 rounded-lg backdrop-blur-sm text-sm">
          {artifacts.length} {t('galleryTour.artworks', 'artworks')}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Export from pages index**

Modify: `src/pages/index.ts`

```typescript
export { HomePage } from './HomePage';
export { CapturePage } from './CapturePage';
export { GalleryPage } from './GalleryPage';
export { ArtifactDetailPage } from './ArtifactDetailPage';
export { SettingsPage } from './SettingsPage';
export { PublicGalleryPage } from './PublicGalleryPage';
export { GalleryTourPage } from './GalleryTourPage';
```

**Step 3: Add route to App.tsx**

Add import and route:

```typescript
import {
  HomePage,
  CapturePage,
  GalleryPage,
  ArtifactDetailPage,
  SettingsPage,
  PublicGalleryPage,
  GalleryTourPage,
} from '@/pages';

// In routes (outside Layout for fullscreen):
<Route path="gallery-tour" element={<GalleryTourPage />} />
```

**Step 4: Add translations**

Add to `src/i18n/locales/en.json`:

```json
{
  "galleryTour": {
    "welcome": "Welcome to the Gallery",
    "mobileMove": "Use left side to move",
    "mobileLook": "Drag right side to look around",
    "mobileTap": "Tap artwork to see details",
    "desktopMove": "WASD or Arrow keys to move",
    "desktopLook": "Mouse to look around",
    "desktopSprint": "Hold Shift to sprint",
    "desktopClick": "Click to enable controls",
    "enter": "Enter Gallery",
    "noWebGL": "Your browser does not support 3D graphics.",
    "viewGrid": "View Grid Gallery",
    "artworks": "artworks"
  },
  "gallery": {
    "colorScheme": "Color Scheme"
  }
}
```

Add to `src/i18n/locales/he.json`:

```json
{
  "galleryTour": {
    "welcome": "ברוכים הבאים לגלריה",
    "mobileMove": "השתמשו בצד שמאל לתנועה",
    "mobileLook": "גררו בצד ימין להסתכל",
    "mobileTap": "הקישו על יצירה לפרטים",
    "desktopMove": "WASD או חצים לתנועה",
    "desktopLook": "עכבר להסתכל",
    "desktopSprint": "החזיקו Shift לריצה",
    "desktopClick": "לחצו להפעלת הפקדים",
    "enter": "כניסה לגלריה",
    "noWebGL": "הדפדפן שלך לא תומך בגרפיקה תלת מימדית.",
    "viewGrid": "צפייה בגלריה",
    "artworks": "יצירות"
  },
  "gallery": {
    "colorScheme": "ערכת צבעים"
  }
}
```

**Step 5: Commit**

```bash
git add src/pages/GalleryTourPage.tsx src/pages/index.ts src/App.tsx src/i18n/locales/en.json src/i18n/locales/he.json
git commit -m "Add 3D gallery tour page with full experience"
```

---

## Phase 5: Polish

### Task 5.1: Add Upload Progress Store

**Files:**
- Create: `src/stores/uploadStore.ts`

**Step 1: Create the store**

```typescript
import { create } from 'zustand';

interface UploadState {
  currentUpload: {
    artifactId: string;
    status: 'uploading' | 'success' | 'error';
    error?: string;
  } | null;
  setCurrentUpload: (upload: UploadState['currentUpload']) => void;
  clearUpload: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  currentUpload: null,
  setCurrentUpload: (upload) => set({ currentUpload: upload }),
  clearUpload: () => set({ currentUpload: null }),
}));
```

**Step 2: Commit**

```bash
git add src/stores/uploadStore.ts
git commit -m "Add upload progress store"
```

---

### Task 5.2: Add Upload Progress UI Component

**Files:**
- Create: `src/components/ui/UploadProgress.tsx`

**Step 1: Create the component**

```typescript
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUploadStore } from '@/stores/uploadStore';

export function UploadProgress() {
  const { t } = useTranslation();
  const { currentUpload, clearUpload } = useUploadStore();

  // Auto-dismiss success after 3 seconds
  useEffect(() => {
    if (currentUpload?.status === 'success') {
      const timer = setTimeout(clearUpload, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentUpload?.status, clearUpload]);

  if (!currentUpload) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div
        className={`rounded-xl p-4 shadow-lg ${
          currentUpload.status === 'success'
            ? 'bg-green-900/90'
            : currentUpload.status === 'error'
            ? 'bg-red-900/90'
            : 'bg-ancient-800/90'
        } backdrop-blur-sm`}
      >
        <div className="flex items-center gap-3">
          {currentUpload.status === 'uploading' && (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-accent-500" />
          )}
          {currentUpload.status === 'success' && (
            <span className="text-green-400 text-xl">✓</span>
          )}
          {currentUpload.status === 'error' && (
            <span className="text-red-400 text-xl">✕</span>
          )}

          <div className="flex-1">
            <p className="text-ancient-100 text-sm font-medium">
              {currentUpload.status === 'uploading' &&
                t('upload.uploading', 'Uploading to gallery...')}
              {currentUpload.status === 'success' &&
                t('upload.success', 'Uploaded to gallery!')}
              {currentUpload.status === 'error' &&
                t('upload.error', 'Upload failed')}
            </p>
            {currentUpload.error && (
              <p className="text-red-300 text-xs mt-1">{currentUpload.error}</p>
            )}
          </div>

          {currentUpload.status !== 'uploading' && (
            <button
              type="button"
              onClick={clearUpload}
              className="text-ancient-400 hover:text-ancient-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Export from ui index**

Add to `src/components/ui/index.ts`:

```typescript
export { UploadProgress } from './UploadProgress';
```

**Step 3: Add to Layout**

Modify `src/components/layout/Layout.tsx` to include:

```typescript
import { UploadProgress } from '@/components/ui';

// In the return, add before closing fragment:
<UploadProgress />
```

**Step 4: Add translations**

Add to `src/i18n/locales/en.json`:

```json
{
  "upload": {
    "uploading": "Uploading to gallery...",
    "success": "Uploaded to gallery!",
    "error": "Upload failed"
  }
}
```

Add to `src/i18n/locales/he.json`:

```json
{
  "upload": {
    "uploading": "מעלה לגלריה...",
    "success": "הועלה לגלריה!",
    "error": "ההעלאה נכשלה"
  }
}
```

**Step 5: Commit**

```bash
git add src/components/ui/UploadProgress.tsx src/components/ui/index.ts src/components/layout/Layout.tsx src/i18n/locales/en.json src/i18n/locales/he.json
git commit -m "Add upload progress UI indicator"
```

---

### Task 5.3: Wire Upload Store to Queue

**Files:**
- Modify: `src/lib/firebase/uploadQueue.ts`

**Step 1: Add store notifications**

At the top, add import:

```typescript
import { useUploadStore } from '@/stores/uploadStore';
```

In `processUpload`, add store updates:

```typescript
async function processUpload(upload: PendingUpload): Promise<void> {
  // ... existing delay check ...

  const { setCurrentUpload } = useUploadStore.getState();

  setCurrentUpload({
    artifactId: upload.artifactId,
    status: 'uploading',
  });

  // ... existing code ...

  try {
    await uploadToGallery(upload.artifactId);

    await db.pendingUploads.delete(upload.id);
    console.log(`[Gallery Upload] Successfully uploaded ${upload.artifactId}`);

    setCurrentUpload({
      artifactId: upload.artifactId,
      status: 'success',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // ... existing error handling ...

    setCurrentUpload({
      artifactId: upload.artifactId,
      status: 'error',
      error: errorMessage,
    });
  }
}
```

**Step 2: Commit**

```bash
git add src/lib/firebase/uploadQueue.ts
git commit -m "Wire upload store to queue for UI updates"
```

---

### Task 5.4: Add Navigation to Public Gallery

**Files:**
- Modify: `src/components/layout/Navigation.tsx` (or wherever nav exists)

**Step 1: Add public gallery link**

Add a new navigation item pointing to `/public-gallery` with appropriate icon and translation.

**Step 2: Commit**

```bash
git add src/components/layout/Navigation.tsx
git commit -m "Add public gallery to navigation"
```

---

### Task 5.5: Final Testing & Verification

**Step 1: Run the app**

```bash
npm run dev
```

**Step 2: Test colorization flow**

1. Capture or upload an image
2. Colorize it
3. Verify upload queue triggers (check console for `[Gallery Upload]` logs)

**Step 3: Test public gallery**

1. Navigate to `/public-gallery`
2. Verify artifacts load from Firestore
3. Click "Enter Virtual Gallery"

**Step 4: Test 3D tour**

1. Verify room renders
2. Test WASD movement (desktop) or touch (mobile)
3. Click on artwork frames
4. Verify info overlay appears

**Step 5: Build check**

```bash
npm run build
```

Expected: No TypeScript errors

**Step 6: Commit**

```bash
git add -A
git commit -m "Complete public art gallery implementation"
```

---

## Summary

This plan implements the full public art gallery feature:

1. **Phase 1** - Firebase configuration and types
2. **Phase 2** - Upload queue with retry logic
3. **Phase 3** - 2D public gallery grid page
4. **Phase 4** - 3D virtual gallery tour
5. **Phase 5** - Upload progress UI and polish

Total: ~35 files created/modified across 20+ tasks.

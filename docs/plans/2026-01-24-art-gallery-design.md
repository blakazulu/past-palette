# Past Palette - Public Art Gallery Design

**Date:** 2026-01-24
**Status:** Approved
**Goal:** Community showcase where users share colorized artifacts publicly via a 3D virtual art gallery

---

## 1. Architecture Overview

A public art gallery for Past Palette where all colorized artifacts are automatically shared. Users can browse a 3D virtual gallery showing the 30 most recent community artworks as framed images on walls.

### Three Main Components

```
┌─────────────────────────────────────────────────────┐
│  1. FIREBASE BACKEND                                │
│     • Firestore: gallery_artifacts collection       │
│     • Storage: gallery/images/{id}.jpg              │
└─────────────────────────────────────────────────────┘
                         ↑
┌─────────────────────────────────────────────────────┐
│  2. UPLOAD SYSTEM                                   │
│     • Auto-queue on colorization complete           │
│     • Retry queue with exponential backoff          │
│     • Upload: thumbnail + all color variants        │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│  3. VIRTUAL GALLERY                                 │
│     • Single open room, ~30 framed artworks         │
│     • First-person controls (WASD + touch)          │
│     • Walk up to artwork to see details             │
└─────────────────────────────────────────────────────┘
```

### New Routes

- `/gallery` - Existing local gallery (My Artifacts)
- `/public-gallery` - 2D grid of public artworks (entry point)
- `/gallery-tour` - 3D virtual walkthrough experience

---

## 2. Firebase Data Model

### Firestore Collection: `gallery_artifacts`

```typescript
interface GalleryArtifact {
  id: string;                    // Same as local artifact ID
  deviceId: string;              // For moderation tracking

  // Display info
  name: string;                  // "Ancient Pottery Shard"
  siteName?: string;             // "Tel Megiddo"
  discoveryLocation?: string;

  // Images (Firebase Storage URLs)
  originalImageUrl: string;      // The grayscale original
  thumbnailUrl: string;          // 400px thumbnail for grid

  // All colorized variants
  variants: {
    id: string;
    imageUrl: string;            // Full colorized image
    colorScheme: 'egyptian' | 'roman' | 'greek' | 'mesopotamian' | 'custom';
    prompt?: string;             // If custom scheme
  }[];

  // Metadata
  createdAt: Timestamp;
  status: 'published' | 'flagged' | 'removed';
}
```

### Firebase Storage Structure

```
gallery/
├── thumbnails/{artifactId}.jpg      # 400px, JPEG 0.8
├── originals/{artifactId}.jpg       # Original grayscale
└── variants/{variantId}.jpg         # Each colorized version
```

---

## 3. Upload Queue System

### Upload Triggers (4 mechanisms)

1. **On colorization complete** - Queue immediately when a new variant is created
2. **On app startup** - Check for any un-uploaded or failed artifacts, retry them
3. **On coming online** - When device reconnects, process the queue
4. **Periodic** - Every 2 minutes while online, process pending uploads

### Local Queue Table (Dexie)

```typescript
// Add to existing db schema
interface PendingUpload {
  id: string;
  artifactId: string;
  status: 'pending' | 'uploading' | 'failed';
  attempts: number;
  lastAttempt?: Date;
  error?: string;
  createdAt: Date;
}
```

### Retry Logic

- Max 5 attempts with exponential backoff: 0s, 5s, 15s, 45s, 120s
- After 5 failures → marked as `failed`
- On app startup → reset all `failed` back to `pending` (once per 24h)

### Upload Flow

```
Colorization completes
       ↓
Add to pendingUploads table (status: 'pending')
       ↓
Process queue immediately
       ↓
Upload: thumbnail → original → all variants → Firestore doc
       ↓
Success? Remove from queue
Failed? Increment attempts, schedule retry
```

---

## 4. 3D Virtual Gallery

### Environment: Single Open Gallery Room

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│    ┌──┐  ┌──┐  ┌──┐  ┌──┐  ┌──┐  ┌──┐  ┌──┐  ┌──┐    │  ← North wall (8 frames)
│                                                        │
│  ┌──┐                                            ┌──┐  │
│                                                        │
│  ┌──┐              OPEN FLOOR                    ┌──┐  │  ← Side walls (4 each)
│                                                        │
│  ┌──┐                                            ┌──┐  │
│                                                        │
│  ┌──┐                                            ┌──┐  │
│                                                        │
│    ┌──┐  ┌──┐  ┌──┐  ┌──┐  ┌──┐  ┌──┐  ┌──┐  ┌──┐    │  ← South wall (8 frames)
│                          ↑                             │
│                      ENTRANCE                          │
└────────────────────────────────────────────────────────┘

Total: ~30 frame positions on walls
```

### Gallery Dimensions

- Width: 24 units (X: -12 to +12)
- Depth: 20 units (Z: -10 to +10)
- Height: 4 units (museum ceiling feel)
- Frames mounted at eye level (~1.6 units)

### Frame Component

- Canvas/frame mesh with artwork texture
- Small spotlight above each frame
- Name plaque below frame
- Click/proximity → shows info overlay with all variants

### Visual Style

- Warm wood flooring
- Light neutral walls (to not compete with art)
- Soft ambient + directional lighting
- Subtle fog for depth

### Content

- 30 latest artworks from Firestore
- Shuffled each visit for discovery
- All public (no personal/private distinction)

---

## 5. Controls & Interaction

### Desktop Controls

- WASD / Arrow keys → Movement
- Mouse → Look around (pointer lock on click)
- Shift → Sprint (2x speed)
- ESC → Release pointer / Exit

### Mobile Controls

- Left virtual joystick → Movement
- Right side drag → Look around
- Tap frame → Select artwork

### Movement Settings

- Base speed: 4 units/second
- Sprint: 2x multiplier
- Player height: 1.7 units
- Collision radius: 0.4 units

### Proximity Interaction

When player approaches a frame (< 2 units):
- Frame gets subtle highlight/glow
- Info overlay appears showing:
  - Artifact name & site
  - Color scheme of displayed variant
  - Thumbnail strip of all variants (tap to switch)
  - "View Original" toggle for before/after

### Collision Detection

- Wall boundaries (can't walk through walls)
- No pedestal collisions (open floor plan)
- Simple box boundaries for the 4 walls

### Teleport Feature

- "Next Artwork" button cycles through frames
- Smooth camera animation to each position
- Counter shows "5/30" progress

---

## 6. Performance & Mobile Optimization

### Desktop vs Mobile Rendering

| Feature | Desktop | Mobile |
|---------|---------|--------|
| Shadows | Enabled | Disabled |
| Pixel ratio | [1, 2] | [1, 1] |
| Antialiasing | Yes | No |
| Frame spotlights | 30 | 10 (nearest only) |
| Texture resolution | Full | Half |
| Fog range | 20-50 | 10-30 |

### Image Loading Strategy

- Thumbnails load first (fast grid display)
- Full images load on-demand as player approaches
- Keep only ~10 full-res textures in memory
- Dispose distant textures, reload on approach

### Progressive Loading

1. Gallery shell renders immediately (floor, walls, empty frames)
2. Thumbnails stream in from Firebase
3. Frame textures apply as images load
4. Spotlights activate per-frame

### Texture Management

```typescript
// Load texture when player within 8 units
// Dispose texture when player beyond 15 units
// Prevents memory bloat on mobile
```

### Fallback

- If WebGL unavailable → show 2D grid gallery instead
- Detect via `WebGLRenderingContext` check on mount

---

## 7. File Structure

### New Files to Create

```
src/
├── lib/
│   └── firebase/
│       ├── config.ts              # Firebase initialization
│       ├── galleryService.ts      # Upload/fetch functions
│       └── uploadQueue.ts         # Retry queue system
├── pages/
│   ├── PublicGalleryPage.tsx      # 2D grid entry point
│   └── GalleryTourPage.tsx        # 3D virtual tour
├── components/
│   ├── gallery-tour/
│   │   ├── GalleryRoom.tsx        # 3D environment (walls, floor, lighting)
│   │   ├── ArtworkFrame.tsx       # Individual framed artwork
│   │   ├── FrameSpotlight.tsx     # Per-frame lighting
│   │   ├── FirstPersonControls.tsx # Desktop WASD + mouse
│   │   ├── TouchControls.tsx      # Mobile joystick
│   │   ├── ProximityDetector.tsx  # Detects nearby frames
│   │   ├── ArtworkInfoOverlay.tsx # Details panel when near frame
│   │   └── collision.ts           # Wall collision logic
│   └── ui/
│       └── UploadProgress.tsx     # Upload status indicator
└── stores/
    └── uploadStore.ts             # Upload progress state
```

### Dependencies to Add

```bash
npm install firebase                    # Firebase SDK
npm install @react-three/fiber @react-three/drei three  # 3D rendering
npm install @types/three               # TypeScript types
```

### Existing Files to Modify

- `src/lib/db/index.ts` - Add `pendingUploads` table
- `src/App.tsx` - Initialize upload queue on startup
- `src/components/artifact/ColorsTab.tsx` - Trigger upload on colorization complete

---

## 8. Implementation Phases

### Phase 1: Firebase Setup
- Create Firebase project
- Configure Firestore + Storage
- Add config to Past Palette
- Create `gallery_artifacts` collection

### Phase 2: Upload System
- Add `pendingUploads` table to Dexie
- Build `uploadQueue.ts` with retry logic
- Build `galleryService.ts` (upload/fetch)
- Hook into colorization complete flow
- Add startup check in `App.tsx`

### Phase 3: Public Gallery Page (2D)
- Create `/public-gallery` route
- Fetch latest 30 artifacts from Firestore
- Grid display with thumbnails
- "Enter Gallery" button → launches 3D tour

### Phase 4: 3D Virtual Gallery
- Install Three.js dependencies
- Build gallery room environment
- Build artwork frames with textures
- Add first-person controls (desktop + mobile)
- Add proximity detection + info overlay
- Add teleport navigation

### Phase 5: Polish
- Upload progress indicator
- Loading states
- Mobile optimizations
- Error handling

---

## 9. Environment Variables

Required in `.env.local`:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

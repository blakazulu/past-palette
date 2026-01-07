# Past Palette - Implementation Plan

**Purpose:** AI colorization PWA for archaeology artifacts with historically accurate cultural palettes

## Development Guidelines

1. **Mobile-First Design**: Primary target is phone usage. Design for mobile first, then enhance for desktop
2. **Localization from Start**: All UI text must use i18next from day one (en/he)
3. **Living Document**: Update this plan as implementation progresses (mark completed items, add learnings)
4. **Plugin-Driven Development**: Use `feature-dev` and `frontend-design` plugins for implementation
5. **PWA Scope**: PWA features are limited to:
   - App installation on phones (manifest.json, icons)
   - Mobile-optimized appearance (viewport, touch interactions)
   - Basic offline support for viewing saved artifacts
   - NOT a full offline-first architecture

## Design Philosophy

- **Dark theme only** (museum-quality aesthetic from reference design - no light/dark switching)
- **Touch-friendly**: Large tap targets (min 44px), swipe gestures
- **Responsive**: Mobile-first breakpoints (sm → md → lg)
- **RTL-ready**: Hebrew support requires RTL layout considerations from start
- **Visual richness**: Warm golds, deep blues, ancient artifact feel

## Tech Stack

- React 19 + TypeScript + Vite
- TailwindCSS v4 (with `@tailwindcss/postcss`)
- Zustand (state management)
- TanStack Query (async data fetching)
- Dexie.js (IndexedDB, offline-first storage)
- i18next (English/Hebrew internationalization)
- Netlify Functions (serverless backend)

## AI Services

| Service | Provider | Purpose |
|---------|----------|---------|
| Image Colorization | Google Gemini 2.5 Flash Image | Historically accurate colorization |

## Project Structure

```
past-palette/
├── public/
│   ├── manifest.json          # PWA manifest (install on phones)
│   └── icons/                 # App icons (192x192, 512x512)
├── src/
│   ├── components/
│   │   ├── camera/
│   │   │   ├── CaptureSession.tsx    # Single image camera capture
│   │   │   ├── FileUpload.tsx        # Drag-and-drop upload
│   │   │   └── CameraView.tsx        # Camera stream display
│   │   ├── colorization/
│   │   │   ├── ColorSchemeSelector.tsx   # Scheme picker with swatches
│   │   │   ├── ColorizationCard.tsx      # Main colorization UI
│   │   │   ├── ColorizationProgress.tsx  # Progress bar + status
│   │   │   ├── ColorVariantCard.tsx      # Individual variant display
│   │   │   ├── ColorVariantGallery.tsx   # Gallery of variants
│   │   │   ├── VariantDetailView.tsx     # Full-screen variant view
│   │   │   ├── BeforeAfterSlider.tsx     # Interactive comparison
│   │   │   └── ColorVariantExport.tsx    # Export variants
│   │   ├── gallery/
│   │   │   ├── GalleryGrid.tsx       # Grid layout for artifacts
│   │   │   ├── GalleryList.tsx       # List layout alternative
│   │   │   ├── ArtifactCard.tsx      # Individual artifact card
│   │   │   ├── GalleryToolbar.tsx    # Search, filter, view toggle
│   │   │   └── GalleryFilters.tsx    # Filter panel
│   │   ├── layout/
│   │   │   ├── Layout.tsx            # Main wrapper
│   │   │   ├── Header.tsx            # App header
│   │   │   └── BottomNav.tsx         # Mobile bottom navigation
│   │   └── ui/
│   │       ├── LoadingSpinner.tsx    # Loading indicator
│   │       ├── ErrorBoundary.tsx     # React error boundary
│   │       ├── OfflineIndicator.tsx  # Offline status badge
│   │       └── InstallPrompt.tsx     # PWA install banner
│   ├── hooks/
│   │   ├── useColorize.ts            # Core colorization logic
│   │   ├── useArtifactData.ts        # Load artifact with variants
│   │   └── useGalleryFilters.ts      # Filter/search/sort logic
│   ├── lib/
│   │   ├── api/
│   │   │   └── client.ts             # API wrapper functions
│   │   ├── db/
│   │   │   └── index.ts              # Dexie database schema
│   │   └── utils/
│   │       ├── image.ts              # Image processing utilities
│   │       └── export.ts             # Export utilities
│   ├── pages/
│   │   ├── HomePage.tsx              # Landing page
│   │   ├── CapturePage.tsx           # Camera/upload interface
│   │   ├── GalleryPage.tsx           # Artifact gallery
│   │   ├── ArtifactDetailPage.tsx    # Detail with color variants
│   │   └── SettingsPage.tsx          # App settings
│   ├── stores/
│   │   └── appStore.ts               # Zustand stores
│   ├── types/
│   │   └── artifact.ts               # TypeScript types
│   ├── i18n/
│   │   ├── index.ts                  # i18next config
│   │   └── locales/
│   │       ├── en.json               # English translations
│   │       └── he.json               # Hebrew translations
│   ├── App.tsx                       # Root component with routes
│   ├── main.tsx                      # Entry point
│   └── index.css                     # Global styles + Tailwind
├── netlify/
│   └── functions/
│       └── colorize.ts               # Colorization API
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── netlify.toml
```

## Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Landing with app intro and CTA |
| `/capture` | CapturePage | Camera or file upload (single image) |
| `/gallery` | GalleryPage | Artifact grid with search/filter |
| `/artifact/:id` | ArtifactDetailPage | Color variants tab, original photo tab |
| `/settings` | SettingsPage | Language, colorization preferences |

## Database Schema (IndexedDB via Dexie)

```typescript
// src/lib/db/index.ts
import Dexie, { Table } from 'dexie';

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
```

## Core Types

```typescript
// src/types/artifact.ts

export type ArtifactStatus =
  | 'draft'
  | 'images-captured'
  | 'colorizing'
  | 'complete'
  | 'error';

export type ColorScheme =
  | 'roman'
  | 'greek'
  | 'egyptian'
  | 'mesopotamian'
  | 'weathered'
  | 'original'
  | 'custom';

export interface Artifact {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: ArtifactStatus;
  imageIds: string[];
  colorVariantIds: string[];
  metadata: ArtifactMetadata;
  thumbnailBlob?: Blob;
}

export interface ArtifactMetadata {
  name?: string;
  discoveryLocation?: string;
  siteName?: string;
  dateFound?: Date;
  notes?: string;
  tags?: string[];
}

export interface ArtifactImage {
  id: string;
  artifactId: string;
  blob: Blob;
  createdAt: Date;
  width: number;
  height: number;
}

export interface ColorVariant {
  id: string;
  artifactId: string;
  blob: Blob;
  createdAt: Date;
  colorScheme: ColorScheme;
  prompt: string;
  aiModel: string;
  isSpeculative: true;  // Always true - AI colorization is speculative
}
```

## Color Schemes

| Scheme | Description | Color Palette |
|--------|-------------|---------------|
| **Roman** | Ancient Roman empire colors | Vermillion, crimson, Egyptian blue, gold leaf, terracotta, ochre |
| **Greek** | Classical Greek pottery style | Terracotta orange, black (black-figure), Mediterranean blue, white slip |
| **Egyptian** | Ancient Egyptian sacred colors | Lapis lazuli blue, gold (sacred), turquoise, emerald green, red ochre |
| **Mesopotamian** | Babylonian/Assyrian colors | Ultramarine, lapis lazuli, gold, brick red, bitumen black |
| **Weathered** | Aged and faded appearance | Muted tones, faded pigments, visible patina, aged surface |
| **Original** | Auto-detect original colors | AI determines most likely original color scheme |
| **Custom** | User-defined prompt | User provides custom colorization instructions |

## State Management (Zustand)

```typescript
// src/stores/appStore.ts

// Store 1: App State
interface AppState {
  currentArtifactId: string | null;
  processingStatus: ProcessingStatus | null;
  isOnline: boolean;
  // Actions
  setCurrentArtifact: (id: string | null) => void;
  setProcessingStatus: (status: ProcessingStatus | null) => void;
  updateProcessingProgress: (progress: number, message?: string) => void;
  setProcessingError: (error: string) => void;
  setOnlineStatus: (isOnline: boolean) => void;
}

interface ProcessingStatus {
  artifactId: string;
  step: 'idle' | 'uploading' | 'colorizing' | 'complete' | 'error';
  progress: number;  // 0-100
  message?: string;
  error?: string;
}

// Store 2: Settings (Persisted)
interface SettingsState {
  language: 'en' | 'he';
  defaultColorScheme: ColorScheme;
  includeRestoration: boolean;
  hapticsEnabled: boolean;
  // Actions
  setLanguage: (language: 'en' | 'he') => void;
  setDefaultColorScheme: (scheme: ColorScheme) => void;
  setIncludeRestoration: (include: boolean) => void;
}

// Store 3: Capture Session
interface CaptureState {
  isCapturing: boolean;
  capturedImage: CaptureImage | null;
  selectedCamera: 'user' | 'environment';
  // Actions
  startCapture: () => void;
  endCapture: () => void;
  setCapturedImage: (image: CaptureImage | null) => void;
  setSelectedCamera: (camera: 'user' | 'environment') => void;
}
```

## API Function

### colorize.ts

```typescript
// netlify/functions/colorize.ts

interface ColorizeRequest {
  imageBase64: string;
  colorScheme: ColorScheme;
  customPrompt?: string;        // Required if colorScheme is 'custom'
  includeRestoration?: boolean; // Also fix cracks, damage, etc.
}

interface ColorizeResponse {
  success: boolean;
  colorizedImageBase64?: string;
  method?: string;
  error?: string;
  processingTimeMs?: number;
}
```

### Color Scheme Prompts

```typescript
const COLOR_SCHEME_PROMPTS: Record<ColorScheme, string> = {
  roman: `Colorize this archaeological artifact using historically accurate Ancient Roman colors:
    - Vermillion and crimson reds (from cinnabar and iron oxide)
    - Egyptian blue (calcium copper silicate)
    - Gold leaf accents on important areas
    - Terracotta and ochre earth tones
    - Deep purple (Tyrian purple for prestigious items)
    Apply colors as they would have appeared when newly made in Ancient Rome.`,

  greek: `Colorize this archaeological artifact using historically accurate Ancient Greek colors:
    - Terracotta orange (natural clay color)
    - Black glaze (black-figure pottery style)
    - Mediterranean blue for sea-related items
    - White slip for backgrounds
    - Red-figure style with reserved red on black
    Apply colors consistent with Classical Greek pottery and sculpture.`,

  egyptian: `Colorize this archaeological artifact using historically accurate Ancient Egyptian colors:
    - Lapis lazuli blue (sacred color of the sky and Nile)
    - Gold (sacred color of the sun god Ra)
    - Turquoise and Egyptian faience blue
    - Emerald green (color of rebirth and vegetation)
    - Red ochre (color of life and vitality)
    - Black (color of fertile Nile soil)
    Apply colors as they would have appeared in Ancient Egyptian art.`,

  mesopotamian: `Colorize this archaeological artifact using historically accurate Ancient Mesopotamian colors:
    - Ultramarine and lapis lazuli blue (precious and sacred)
    - Gold and bronze metallic tones
    - Brick red and terracotta (ziggurat colors)
    - Bitumen black
    - White limestone accents
    Apply colors consistent with Babylonian and Assyrian art.`,

  weathered: `Apply historically plausible colors to this artifact, but show them as weathered and aged:
    - Muted, faded versions of original pigments
    - Visible patina and surface degradation
    - Some original color remaining in protected areas
    - Natural aging and oxidation effects
    Show how the artifact might look with its original colors partially preserved.`,

  original: `Analyze this archaeological artifact and apply the most historically accurate colors based on:
    - The artifact's apparent culture and time period
    - Typical pigments and dyes available to that civilization
    - Common color schemes used for this type of object
    - Archaeological evidence of original coloring
    Apply colors as they would have originally appeared.`,

  custom: '', // User provides their own prompt
};
```

### Implementation

```typescript
// netlify/functions/colorize.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export const handler = async (event) => {
  const { imageBase64, colorScheme, customPrompt, includeRestoration } = JSON.parse(event.body);

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-preview-04-17',
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  const basePrompt = colorScheme === 'custom'
    ? customPrompt
    : COLOR_SCHEME_PROMPTS[colorScheme];

  const restorationAddition = includeRestoration
    ? `\n\nAlso restore and repair any visible damage:
       - Fill in cracks and missing areas
       - Repair chips and erosion
       - Enhance clarity while maintaining authenticity
       - Remove dirt and discoloration artifacts`
    : '';

  const fullPrompt = `${basePrompt}${restorationAddition}

IMPORTANT: This is for archaeological research and education.
The colorization is speculative and based on historical evidence.
Output a high-quality colorized version of the artifact image.`;

  const result = await model.generateContent([
    { text: fullPrompt },
    { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
  ]);

  // Extract image from response
  const colorizedImage = result.response.candidates[0].content.parts
    .find(part => part.inlineData)?.inlineData?.data;

  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      colorizedImageBase64: colorizedImage,
      method: 'gemini-2.5-flash-image',
    }),
  };
};
```

## Key Hooks

### useColorize

```typescript
// src/hooks/useColorize.ts

interface UseColorizeReturn {
  colorize: (
    artifactId: string,
    imageBlob: Blob,
    colorScheme: ColorScheme,
    customPrompt?: string,
    includeRestoration?: boolean
  ) => Promise<void>;
  progress: number;           // 0-100
  status: 'idle' | 'uploading' | 'colorizing' | 'complete' | 'error';
  error: string | null;
  variant: ColorVariant | null;
  cancel: () => void;
}

// Progress breakdown:
// 0-10%: Preparing image
// 10-85%: Processing with Gemini
// 85-100%: Saving variant to IndexedDB
```

## Key Components

### ColorSchemeSelector

```typescript
// src/components/colorization/ColorSchemeSelector.tsx

interface ColorSchemeOption {
  id: ColorScheme;
  name: string;
  description: string;
  swatches: string[];  // Hex colors for preview
}

const COLOR_SCHEMES: ColorSchemeOption[] = [
  {
    id: 'roman',
    name: 'Roman',
    description: 'Ancient Roman empire colors',
    swatches: ['#C41E3A', '#1E4D8C', '#DAA520', '#CD853F'],
  },
  {
    id: 'greek',
    name: 'Greek',
    description: 'Classical Greek pottery style',
    swatches: ['#D2691E', '#1C1C1C', '#4169E1', '#FFFAF0'],
  },
  {
    id: 'egyptian',
    name: 'Egyptian',
    description: 'Ancient Egyptian sacred colors',
    swatches: ['#1E3F66', '#FFD700', '#40E0D0', '#228B22'],
  },
  {
    id: 'mesopotamian',
    name: 'Mesopotamian',
    description: 'Babylonian and Assyrian colors',
    swatches: ['#000080', '#B8860B', '#8B4513', '#1C1C1C'],
  },
  {
    id: 'weathered',
    name: 'Weathered',
    description: 'Aged with natural patina',
    swatches: ['#9B8B7A', '#7A6B5A', '#5A4B3A', '#8B7355'],
  },
  {
    id: 'original',
    name: 'Original',
    description: 'AI-detected original colors',
    swatches: ['#A0A0A0', '#808080', '#606060', '#404040'],
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Your own color instructions',
    swatches: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
  },
];
```

### BeforeAfterSlider

```typescript
// src/components/colorization/BeforeAfterSlider.tsx

interface BeforeAfterSliderProps {
  beforeImage: Blob;
  afterImage: Blob;
  orientation?: 'horizontal' | 'vertical';
}

// Features:
// - Draggable divider line
// - Touch and mouse support
// - Smooth animations
// - Full-screen toggle
// - Labels for "Before" and "After"
```

### ColorVariantGallery

```typescript
// src/components/colorization/ColorVariantGallery.tsx

interface ColorVariantGalleryProps {
  artifactId: string;
  variants: ColorVariant[];
  onSelectVariant: (variant: ColorVariant) => void;
  onDeleteVariant: (variantId: string) => void;
}

// Features:
// - Grid of variant thumbnails
// - Color scheme badge on each
// - Click to view detail
// - Swipe to delete (mobile)
// - "Add Variant" button
```

## User Flows

### Flow 1: Capture → Colorize → Compare

```
1. User opens /capture
2. Takes single photo or uploads image
3. Creates artifact with status: 'images-captured'
4. Redirects to /artifact/:id
5. ColorSchemeSelector shows 7 options
6. User selects scheme (e.g., "Egyptian")
7. Clicks "Colorize"
8. useColorize hook:
   - Converts Blob to base64
   - Calls colorize function with scheme
   - Shows progress (preparing → colorizing → saving)
   - Saves ColorVariant to IndexedDB
9. Variant appears in ColorVariantGallery
10. User clicks to view BeforeAfterSlider
```

### Flow 2: Multiple Variants

```
1. From /artifact/:id, user has one variant
2. Clicks "Add Another Variant"
3. ColorSchemeSelector appears
4. Selects different scheme (e.g., "Greek")
5. New variant generated
6. Both variants shown in gallery
7. User can compare side-by-side
8. Download individual or all variants
```

## Implementation Steps

### Phase 1: Project Setup ✅
- [x] Initialize Vite + React + TypeScript project
- [x] Configure TailwindCSS v4 with `@tailwindcss/postcss`
- [x] Set up path alias `@/` → `src/`
- [x] Add PWA manifest.json (icon paths defined, actual icons pending)
- [x] Configure Netlify deployment (netlify.toml)
- [x] Set up custom dark theme colors (ancient, gold, egyptian, accent, terra)
- [x] ESLint 9 with flat config

### Phase 2: Core Infrastructure
- [ ] Set up i18next with en/he locales (PRIORITY - all UI text uses translations)
- [ ] Configure RTL support for Hebrew
- [ ] Implement Dexie database schema
- [ ] Create Zustand stores (app, settings, capture)
- [ ] Set up TanStack Query provider
- [ ] Create API client wrapper
- [ ] Build utility functions

### Phase 3: Layout & Navigation
- [ ] Create Layout component with Header and BottomNav
- [ ] Set up React Router with all routes
- [ ] Build HomePage with app introduction
- [ ] Create SettingsPage
- [ ] Add offline indicator

### Phase 4: Camera & Upload
- [ ] Build CameraView with stream display
- [ ] Implement CaptureSession (single image mode)
- [ ] Build FileUpload with drag-and-drop
- [ ] Wire up CapturePage

### Phase 5: Gallery
- [ ] Build ArtifactCard component
- [ ] Create GalleryGrid and GalleryList
- [ ] Implement GalleryToolbar
- [ ] Build GalleryFilters
- [ ] Create useGalleryFilters hook
- [ ] Add empty states

### Phase 6: Colorization Core
- [ ] Create ColorSchemeSelector with visual swatches
- [ ] Build ColorizationProgress component
- [ ] Implement ColorizationCard (idle, processing, complete, error)
- [ ] Create useColorize hook with progress tracking

### Phase 7: Color Variant Display
- [ ] Build ColorVariantCard component
- [ ] Create ColorVariantGallery
- [ ] Implement VariantDetailView
- [ ] Build BeforeAfterSlider:
  - Draggable divider
  - Touch support
  - Smooth transitions
- [ ] Add ColorVariantExport

### Phase 8: Backend Function
- [ ] Implement colorize.ts:
  - Gemini 2.5 Flash Image integration
  - All 7 color scheme prompts
  - Restoration option
  - Error handling

### Phase 9: Artifact Detail Page
- [ ] Build DetailHeader
- [ ] Create TabNav (Colors, Original)
- [ ] Implement ColorsTab with:
  - ColorVariantGallery (if variants exist)
  - ColorizationCard (to add new)
  - VariantDetailView (when selected)
- [ ] Build OriginalTab with source image
- [ ] Wire up ArtifactDetailPage

### Phase 10: PWA & Mobile Polish
- [ ] Add PWA manifest.json with icons
- [ ] Configure viewport meta tags for mobile
- [ ] Add InstallPrompt component
- [ ] Test installation on iOS and Android
- [ ] Verify touch interactions work smoothly

### Phase 11: Data Management
- [ ] Build ExportDialog
- [ ] Create ImportDialog
- [ ] Add DeleteConfirmDialog
- [ ] Implement bulk download of variants

### Phase 12: Polish
- [ ] Responsive design testing
- [ ] RTL support for Hebrew
- [ ] Loading states and skeletons
- [ ] Error boundaries
- [ ] Accessibility audit
- [ ] Performance optimization

## Environment Variables

```env
# .env (local development)
GOOGLE_AI_API_KEY=your_gemini_api_key

# Netlify environment variables (production)
# Set via Netlify dashboard or CLI:
# netlify env:set GOOGLE_AI_API_KEY your_gemini_api_key
```

## Dependencies

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    "dexie": "^4.0.0",
    "dexie-react-hooks": "^1.1.0",
    "i18next": "^24.0.0",
    "react-i18next": "^15.0.0",
    "i18next-browser-languagedetector": "^8.0.0",
    "uuid": "^11.0.0",
    "@google/generative-ai": "^0.21.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/uuid": "^10.0.0",
    "eslint": "^9.0.0",
    "@netlify/functions": "^3.0.0"
  }
}
```

## Notes

- Past Palette is simpler than Save The Past (no 3D, no Three.js)
- Single image input simplifies the capture flow
- Multiple color variants per artifact enables comparison
- BeforeAfterSlider is the key UX differentiator
- All colorization is marked as "speculative" (isSpeculative: true)
- Restoration option adds value for damaged artifacts
- Gemini 2.5 Flash Image provides fast, high-quality colorization

## Implementation Log

### 2026-01-07: Phase 1 Complete
- Initialized Vite 6 + React 19 + TypeScript project
- Configured TailwindCSS v4 with `@tailwindcss/postcss` and custom `@theme` block
- Custom color palette: `ancient` (dark purples), `gold`, `egyptian` (blues), `accent` (teal), `terra` (terracotta)
- Path alias `@/` → `src/` configured in vite.config.ts and tsconfig.json
- PWA manifest.json with icon paths (icons to be added later)
- Netlify config with SPA routing, security headers, and API function redirects
- ESLint 9 with flat config, TypeScript, React hooks plugins
- Build verified successful

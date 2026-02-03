import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColorScheme, CaptureImage, ProcessingStatus } from '@/types/artifact';

// Store 1: App State (not persisted)
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

export const useAppStore = create<AppState>((set) => ({
  currentArtifactId: null,
  processingStatus: null,
  isOnline: navigator.onLine,

  setCurrentArtifact: (id) => set({ currentArtifactId: id }),

  setProcessingStatus: (status) => set({ processingStatus: status }),

  updateProcessingProgress: (progress, message) =>
    set((state) => ({
      processingStatus: state.processingStatus
        ? { ...state.processingStatus, progress, message }
        : null,
    })),

  setProcessingError: (error) =>
    set((state) => ({
      processingStatus: state.processingStatus
        ? { ...state.processingStatus, step: 'error', error }
        : null,
    })),

  setOnlineStatus: (isOnline) => set({ isOnline }),
}));

// Store 2: Settings (persisted to localStorage)
interface SettingsState {
  language: 'en' | 'he';
  defaultColorScheme: ColorScheme;
  includeRestoration: boolean;
  hapticsEnabled: boolean;
  galleryElements: {
    columns: boolean;
    centralDisplay: boolean;
    floorMosaic: boolean;
    plants: boolean;
  };
  // Actions
  setLanguage: (language: 'en' | 'he') => void;
  setDefaultColorScheme: (scheme: ColorScheme) => void;
  setIncludeRestoration: (include: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setGalleryElement: (key: keyof SettingsState['galleryElements'], value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      defaultColorScheme: 'original',
      includeRestoration: true,
      hapticsEnabled: true,
      galleryElements: {
        columns: true,
        centralDisplay: true,
        floorMosaic: true,
        plants: true,
      },

      setLanguage: (language) => set({ language }),
      setDefaultColorScheme: (scheme) => set({ defaultColorScheme: scheme }),
      setIncludeRestoration: (include) => set({ includeRestoration: include }),
      setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),
      setGalleryElement: (key, value) =>
        set((state) => ({
          galleryElements: { ...state.galleryElements, [key]: value },
        })),
    }),
    {
      name: 'past-palette-settings',
    }
  )
);

// Store 3: Capture Session (not persisted)
interface CaptureState {
  isCapturing: boolean;
  capturedImage: CaptureImage | null;
  selectedCamera: 'user' | 'environment';
  // Actions
  startCapture: () => void;
  endCapture: () => void;
  setCapturedImage: (image: CaptureImage | null) => void;
  setSelectedCamera: (camera: 'user' | 'environment') => void;
  reset: () => void;
}

export const useCaptureStore = create<CaptureState>((set) => ({
  isCapturing: false,
  capturedImage: null,
  selectedCamera: 'environment', // Default to back camera

  startCapture: () => set({ isCapturing: true }),
  endCapture: () => set({ isCapturing: false }),
  setCapturedImage: (image) => set({ capturedImage: image }),
  setSelectedCamera: (camera) => set({ selectedCamera: camera }),
  reset: () => set({ isCapturing: false, capturedImage: null }),
}));

// Initialize online status listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useAppStore.getState().setOnlineStatus(true);
  });
  window.addEventListener('offline', () => {
    useAppStore.getState().setOnlineStatus(false);
  });
}

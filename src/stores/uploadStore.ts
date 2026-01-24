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

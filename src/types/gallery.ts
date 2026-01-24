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

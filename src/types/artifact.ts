export type ArtifactStatus =
  | 'draft'
  | 'images-captured'
  | 'colorizing'
  | 'complete'
  | 'error';

export type ColorScheme =
  | 'mesopotamian'
  | 'egyptian'
  | 'roman'
  | 'greek'
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
  isSpeculative: true; // Always true - AI colorization is speculative
}

export interface CaptureImage {
  blob: Blob;
  width: number;
  height: number;
  timestamp: Date;
}

export interface ProcessingStatus {
  artifactId: string;
  step: 'idle' | 'uploading' | 'colorizing' | 'complete' | 'error';
  progress: number; // 0-100
  message?: string;
  error?: string;
}

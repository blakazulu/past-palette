import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { CameraView } from './CameraView';
import { FileUpload } from './FileUpload';
import { useCaptureStore } from '@/stores/appStore';
import { db } from '@/lib/db';
import { resizeImage, createThumbnail } from '@/lib/utils/image';
import { identifyArtifact, blobToBase64 } from '@/lib/api/client';
import type { Artifact, ArtifactImage } from '@/types/artifact';

type CaptureMode = 'camera' | 'upload';

export function CaptureSession() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { capturedImage, setCapturedImage, reset } = useCaptureStore();
  const [mode, setMode] = useState<CaptureMode>('camera');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Create/cleanup object URL for preview
  useEffect(() => {
    if (!capturedImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(capturedImage.blob);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [capturedImage]);

  const handleCapture = async (blob: Blob, width: number, height: number) => {
    setCapturedImage({ blob, width, height, timestamp: new Date() });
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    // If camera fails, switch to upload mode
    if (mode === 'camera') {
      setMode('upload');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setError(null);
  };

  const handleUsePhoto = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    try {
      // Resize image if needed
      const resizedBlob = await resizeImage(capturedImage.blob, 1920);
      const thumbnailBlob = await createThumbnail(capturedImage.blob, 256);

      // Try to identify the artifact using AI
      let artifactName: string | undefined;
      try {
        const imageBase64 = await blobToBase64(resizedBlob);
        const identifyResult = await identifyArtifact(imageBase64);
        if (identifyResult.success && identifyResult.name) {
          artifactName = identifyResult.name;
        }
      } catch (identifyErr) {
        // Identification failed, continue without name
        console.warn('Artifact identification failed:', identifyErr);
      }

      // Create artifact and image records
      const artifactId = uuidv4();
      const imageId = uuidv4();
      const now = new Date();

      const artifact: Artifact = {
        id: artifactId,
        createdAt: now,
        updatedAt: now,
        status: 'images-captured',
        imageIds: [imageId],
        colorVariantIds: [],
        metadata: {
          name: artifactName,
        },
        thumbnailBlob,
      };

      const image: ArtifactImage = {
        id: imageId,
        artifactId,
        blob: resizedBlob,
        createdAt: now,
        width: capturedImage.width,
        height: capturedImage.height,
      };

      // Save to database
      await db.transaction('rw', [db.artifacts, db.images], async () => {
        await db.artifacts.add(artifact);
        await db.images.add(image);
      });

      // Reset capture state and navigate to artifact
      reset();
      navigate(`/artifact/${artifactId}`);
    } catch (err) {
      console.error('Failed to save artifact:', err);
      setError(t('errors.unknownError'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Show preview if we have a captured image
  if (capturedImage) {
    return (
      <div className="flex flex-col items-center px-4 py-6 opacity-0-initial animate-reveal-up">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500/20 to-gold-600/10 flex items-center justify-center">
            <CheckIcon className="w-4 h-4 text-gold-400" />
          </div>
          <h1 className="text-xl sm:text-2xl text-obsidian-50">
            {t('capture.review') || 'Review Photo'}
          </h1>
        </div>

        {/* Preview with archaeological frame */}
        <div className="relative w-full max-w-md frame-archaeological rounded-xl overflow-hidden mb-8">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Captured"
              className="w-full aspect-[3/4] object-cover"
            />
          )}
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/30 to-transparent pointer-events-none" />
        </div>

        {/* Actions */}
        <div className="flex gap-4 w-full max-w-md">
          <button
            onClick={handleRetake}
            disabled={isProcessing}
            className="btn-ghost flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RetakeIcon className="w-4 h-4" />
            {t('capture.retake')}
          </button>
          <button
            onClick={handleUsePhoto}
            disabled={isProcessing}
            className="btn-gold flex-1 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="spinner-gold w-5 h-5" style={{ borderWidth: '2px' }} />
            ) : (
              <>
                <ArrowRightIcon className="w-4 h-4" />
                {t('capture.usePhoto')}
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4 py-6">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6 opacity-0-initial animate-reveal-up">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lapis-500/20 to-lapis-600/10 flex items-center justify-center">
          <CameraIcon className="w-4 h-4 text-lapis-400" />
        </div>
        <h1 className="text-xl sm:text-2xl text-obsidian-50">
          {t('capture.title')}
        </h1>
      </div>

      {/* Mode toggle */}
      <div className="flex p-1 rounded-xl glass-panel mb-6 opacity-0-initial animate-reveal-up delay-100">
        <button
          onClick={() => setMode('camera')}
          className={`relative px-5 py-2.5 rounded-lg font-display text-sm tracking-wider uppercase transition-all ${
            mode === 'camera'
              ? 'text-obsidian-950'
              : 'text-obsidian-400 hover:text-obsidian-200'
          }`}
        >
          {mode === 'camera' && (
            <div className="absolute inset-0 bg-gradient-to-r from-gold-500 to-gold-400 rounded-lg" />
          )}
          <span className="relative flex items-center gap-2">
            <CameraSmallIcon className="w-4 h-4" />
            {t('capture.takePhoto')}
          </span>
        </button>
        <button
          onClick={() => setMode('upload')}
          className={`relative px-5 py-2.5 rounded-lg font-display text-sm tracking-wider uppercase transition-all ${
            mode === 'upload'
              ? 'text-obsidian-950'
              : 'text-obsidian-400 hover:text-obsidian-200'
          }`}
        >
          {mode === 'upload' && (
            <div className="absolute inset-0 bg-gradient-to-r from-gold-500 to-gold-400 rounded-lg" />
          )}
          <span className="relative flex items-center gap-2">
            <UploadSmallIcon className="w-4 h-4" />
            {t('capture.uploadImage')}
          </span>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 px-5 py-4 rounded-xl glass-panel border-l-2 border-red-500 text-red-400 text-base max-w-md w-full opacity-0-initial animate-reveal-scale">
          <div className="flex items-start gap-3">
            <ErrorIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Camera or Upload */}
      <div className="opacity-0-initial animate-reveal-up delay-200 w-full flex justify-center">
        {mode === 'camera' ? (
          <CameraView onCapture={handleCapture} onError={handleError} />
        ) : (
          <FileUpload onFileSelect={handleCapture} onError={handleError} />
        )}
      </div>
    </div>
  );
}

// Icons
function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  );
}

function CameraSmallIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function UploadSmallIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function RetakeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}

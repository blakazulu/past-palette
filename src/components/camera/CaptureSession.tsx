import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { CameraView } from './CameraView';
import { FileUpload } from './FileUpload';
import { useCaptureStore } from '@/stores/appStore';
import { db } from '@/lib/db';
import { resizeImage, createThumbnail } from '@/lib/utils/image';
import type { Artifact, ArtifactImage } from '@/types/artifact';

type CaptureMode = 'camera' | 'upload';

export function CaptureSession() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { capturedImage, setCapturedImage, reset } = useCaptureStore();
  const [mode, setMode] = useState<CaptureMode>('camera');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
        metadata: {},
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
      <div className="flex flex-col items-center px-4 py-6">
        <h1 className="text-xl font-semibold text-ancient-100 mb-6">
          {t('capture.title')}
        </h1>

        {/* Preview */}
        <div className="relative w-full max-w-md aspect-[3/4] bg-ancient-950 rounded-2xl overflow-hidden">
          <img
            src={URL.createObjectURL(capturedImage.blob)}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6 w-full max-w-md">
          <button
            onClick={handleRetake}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 rounded-xl bg-ancient-800 border border-ancient-700 text-ancient-200 font-medium disabled:opacity-50"
          >
            {t('capture.retake')}
          </button>
          <button
            onClick={handleUsePhoto}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 rounded-xl bg-gold-500 text-ancient-900 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-ancient-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              t('capture.usePhoto')
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4 py-6">
      <h1 className="text-xl font-semibold text-ancient-100 mb-4">
        {t('capture.title')}
      </h1>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('camera')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'camera'
              ? 'bg-gold-500 text-ancient-900'
              : 'bg-ancient-800 text-ancient-300 hover:bg-ancient-700'
          }`}
        >
          {t('capture.takePhoto')}
        </button>
        <button
          onClick={() => setMode('upload')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'upload'
              ? 'bg-gold-500 text-ancient-900'
              : 'bg-ancient-800 text-ancient-300 hover:bg-ancient-700'
          }`}
        >
          {t('capture.uploadImage')}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-error-500/20 border border-error-500/50 text-error-500 text-sm max-w-md w-full text-center">
          {error}
        </div>
      )}

      {/* Camera or Upload */}
      {mode === 'camera' ? (
        <CameraView onCapture={handleCapture} onError={handleError} />
      ) : (
        <FileUpload onFileSelect={handleCapture} onError={handleError} />
      )}
    </div>
  );
}

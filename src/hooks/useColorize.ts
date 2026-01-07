import { useState, useCallback, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import { db } from '@/lib/db';
import { colorizeImage, blobToBase64, base64ToBlob } from '@/lib/api/client';
import type { ColorScheme, ColorVariant } from '@/types/artifact';
import type { ColorizationStep } from '@/components/colorization/ColorizationProgress';

interface UseColorizeReturn {
  colorize: (
    artifactId: string,
    imageBlob: Blob,
    colorScheme: ColorScheme,
    customPrompt?: string,
    includeRestoration?: boolean
  ) => Promise<ColorVariant | null>;
  step: ColorizationStep;
  progress: number;
  error: string | null;
  variant: ColorVariant | null;
  reset: () => void;
  cancel: () => void;
}

export function useColorize(): UseColorizeReturn {
  const [step, setStep] = useState<ColorizationStep>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [variant, setVariant] = useState<ColorVariant | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setStep('idle');
    setProgress(0);
    setError(null);
    setVariant(null);
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    reset();
  }, [reset]);

  const colorize = useCallback(
    async (
      artifactId: string,
      imageBlob: Blob,
      colorScheme: ColorScheme,
      customPrompt?: string,
      includeRestoration?: boolean
    ): Promise<ColorVariant | null> => {
      // Reset state
      setError(null);
      setVariant(null);

      // Create abort controller
      abortControllerRef.current = new AbortController();

      try {
        // Step 1: Preparing (0-10%)
        setStep('preparing');
        setProgress(5);

        // Convert blob to base64
        const imageBase64 = await blobToBase64(imageBlob);
        setProgress(10);

        // Check if cancelled
        if (abortControllerRef.current?.signal.aborted) {
          return null;
        }

        // Step 2: Colorizing (10-85%)
        setStep('colorizing');
        setProgress(15);

        // Simulate progress during API call (actual progress unknown)
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev < 80) return prev + Math.random() * 5;
            return prev;
          });
        }, 500);

        // Call colorization API
        const response = await colorizeImage({
          imageBase64,
          colorScheme,
          customPrompt,
          includeRestoration,
        });

        clearInterval(progressInterval);

        // Check if cancelled
        if (abortControllerRef.current?.signal.aborted) {
          return null;
        }

        if (!response.success || !response.colorizedImageBase64) {
          throw new Error(response.error || 'Colorization failed');
        }

        setProgress(85);

        // Step 3: Saving (85-100%)
        setStep('saving');
        setProgress(90);

        // Convert base64 back to blob
        const colorizedBlob = base64ToBlob(response.colorizedImageBase64, 'image/jpeg');

        // Create variant record
        const newVariant: ColorVariant = {
          id: uuid(),
          artifactId,
          blob: colorizedBlob,
          createdAt: new Date(),
          colorScheme,
          prompt: customPrompt || '',
          aiModel: response.method || 'gemini-2.5-flash-image',
          isSpeculative: true,
        };

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

        setProgress(100);
        setStep('complete');
        setVariant(newVariant);

        return newVariant;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setStep('error');
        return null;
      } finally {
        abortControllerRef.current = null;
      }
    },
    []
  );

  return {
    colorize,
    step,
    progress,
    error,
    variant,
    reset,
    cancel,
  };
}

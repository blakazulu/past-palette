import { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useCaptureStore } from '@/stores/appStore';
import { canvasToBlob, getImageDimensions } from '@/lib/utils/image';

interface CameraViewProps {
  onCapture: (blob: Blob, width: number, height: number) => void;
  onError: (error: string) => void;
}

export function CameraView({ onCapture, onError }: CameraViewProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const { selectedCamera, setSelectedCamera } = useCaptureStore();

  const startCamera = useCallback(async () => {
    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: selectedCamera === 'user' ? 'user' : 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsReady(true);
        setIsMirrored(selectedCamera === 'user');
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          onError(t('errors.cameraPermission'));
        } else {
          onError(t('errors.cameraAccess'));
        }
      } else {
        onError(t('errors.cameraAccess'));
      }
    }
  }, [selectedCamera, onError, t]);

  useEffect(() => {
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !isReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror the image if using front camera
    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);

    try {
      const blob = await canvasToBlob(canvas);
      const { width, height } = await getImageDimensions(blob);
      onCapture(blob, width, height);
    } catch (err) {
      console.error('Capture error:', err);
      onError(t('errors.unknownError'));
    }
  };

  const handleSwitchCamera = () => {
    setSelectedCamera(selectedCamera === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Video preview */}
      <div className="relative w-full max-w-md aspect-[3/4] bg-ancient-950 rounded-2xl overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isMirrored ? 'scale-x-[-1]' : ''}`}
        />

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Viewfinder overlay */}
        <div className="absolute inset-4 border-2 border-white/20 rounded-xl pointer-events-none" />
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-6">
        {/* Switch camera button */}
        <button
          onClick={handleSwitchCamera}
          className="w-12 h-12 rounded-full bg-ancient-800 border border-ancient-700 flex items-center justify-center text-ancient-300 hover:bg-ancient-700 transition-colors"
          aria-label={t('capture.switchCamera')}
        >
          <SwitchCameraIcon className="w-5 h-5" />
        </button>

        {/* Capture button */}
        <button
          onClick={handleCapture}
          disabled={!isReady}
          className="w-16 h-16 rounded-full bg-white border-4 border-ancient-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
          aria-label={t('capture.takePhoto')}
        >
          <div className="w-12 h-12 rounded-full bg-white" />
        </button>

        {/* Placeholder for symmetry */}
        <div className="w-12 h-12" />
      </div>
    </div>
  );
}

function SwitchCameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

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

    ctx.save();
    // Mirror the image if using front camera
    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);
    ctx.restore();

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
    <div className="relative flex flex-col items-center w-full max-w-md">
      {/* Video preview container */}
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden glass-panel-dark">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isMirrored ? 'scale-x-[-1]' : ''}`}
        />

        {/* Loading state */}
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-obsidian-950">
            <div className="spinner-gold mb-4" />
            <p className="text-obsidian-400 text-base font-display tracking-wider">
              {t('capture.initializing') || 'Initializing camera...'}
            </p>
          </div>
        )}

        {/* Viewfinder overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Corner brackets */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-gold-500/50" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-gold-500/50" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-gold-500/50" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-gold-500/50" />

          {/* Center crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gold-500/30" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gold-500/30" />
          </div>

          {/* Ambient gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/40 via-transparent to-transparent" />
        </div>
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="flex items-center justify-center gap-8 mt-8">
        {/* Switch camera button */}
        <button
          onClick={handleSwitchCamera}
          className="w-14 h-14 rounded-full glass-panel flex items-center justify-center text-obsidian-300 hover:text-gold-400 hover:border-gold-500/30 transition-all group"
          aria-label={t('capture.switchCamera')}
        >
          <SwitchCameraIcon className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
        </button>

        {/* Capture button */}
        <button
          onClick={handleCapture}
          disabled={!isReady}
          className="relative w-20 h-20 rounded-full disabled:opacity-50 disabled:cursor-not-allowed group"
          aria-label={t('capture.takePhoto')}
        >
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-gold-500/60 group-hover:border-gold-400 transition-colors" />
          {/* Inner button */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 group-hover:from-gold-300 group-hover:to-gold-400 group-active:scale-90 transition-all shadow-lg shadow-gold-500/30" />
          {/* Shine effect */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent" />
        </button>

        {/* Placeholder for symmetry */}
        <div className="w-14 h-14" />
      </div>

      {/* Tip */}
      <p className="mt-6 text-sm text-obsidian-500 text-center font-display tracking-wider">
        {t('capture.tip') || 'Position artifact in center for best results'}
      </p>
    </div>
  );
}

function SwitchCameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

import { useRef, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Simple SVG icons to avoid external dependency
const ChevronUpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const RotateLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h4V6M3 10l4.5-4.5a7 7 0 1 1 0 9.9" />
  </svg>
);

const RotateRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-4V6M21 10l-4.5-4.5a7 7 0 1 0 0 9.9" />
  </svg>
);

const CompassIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeWidth={2} />
    <polygon fill="currentColor" points="12,2 14,10 12,12 10,10" />
    <polygon fill="currentColor" opacity="0.5" points="12,22 10,14 12,12 14,14" />
  </svg>
);

const JOYSTICK_SIZE = 100;
const KNOB_SIZE = 40;
const MAX_OFFSET = (JOYSTICK_SIZE - KNOB_SIZE) / 2;
const SLIDER_HEIGHT = 140;
const SLIDER_TRACK_HEIGHT = SLIDER_HEIGHT - 16; // Account for padding
const SLIDER_MAX_OFFSET = SLIDER_TRACK_HEIGHT / 2 - KNOB_SIZE / 2;
const DEAD_ZONE = 0.15; // Ignore small movements

interface MobileJoystickUIProps {
  onRotationChange: (value: number) => void; // -1 to 1 (left to right)
  onMovementChange: (value: number) => void; // -1 to 1 (backward to forward)
  onTeleportNext: () => void;
  visible: boolean;
}

export function MobileJoystickUI({
  onRotationChange,
  onMovementChange,
  onTeleportNext,
  visible,
}: MobileJoystickUIProps) {
  const { t } = useTranslation();

  // Rotation joystick state
  const rotationRef = useRef<HTMLDivElement>(null);
  const [rotationKnobOffset, setRotationKnobOffset] = useState({ x: 0, y: 0 });
  const rotationTouchId = useRef<number | null>(null);
  const rotationCenter = useRef({ x: 0, y: 0 });

  // Movement slider state
  const movementRef = useRef<HTMLDivElement>(null);
  const [movementKnobOffset, setMovementKnobOffset] = useState(0);
  const movementTouchId = useRef<number | null>(null);
  const movementCenter = useRef(0);

  // Handle rotation joystick
  const handleRotationStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.changedTouches[0];
    if (!touch || rotationTouchId.current !== null) return;

    rotationTouchId.current = touch.identifier;
    const rect = rotationRef.current?.getBoundingClientRect();
    if (rect) {
      rotationCenter.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
  }, []);

  const handleRotationMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    for (const touch of Array.from(e.changedTouches)) {
      if (touch.identifier === rotationTouchId.current) {
        const dx = touch.clientX - rotationCenter.current.x;
        const dy = touch.clientY - rotationCenter.current.y;

        // Clamp to circle
        const distance = Math.sqrt(dx * dx + dy * dy);
        const clampedDistance = Math.min(distance, MAX_OFFSET);
        const angle = Math.atan2(dy, dx);

        const clampedX = Math.cos(angle) * clampedDistance;
        const clampedY = Math.sin(angle) * clampedDistance;

        setRotationKnobOffset({ x: clampedX, y: clampedY });

        // Normalize X to -1 to 1 for rotation, with dead zone
        const normalizedX = clampedX / MAX_OFFSET;
        onRotationChange(Math.abs(normalizedX) < DEAD_ZONE ? 0 : normalizedX);
      }
    }
  }, [onRotationChange]);

  const handleRotationEnd = useCallback((e: React.TouchEvent) => {
    for (const touch of Array.from(e.changedTouches)) {
      if (touch.identifier === rotationTouchId.current) {
        rotationTouchId.current = null;
        setRotationKnobOffset({ x: 0, y: 0 });
        onRotationChange(0);
      }
    }
  }, [onRotationChange]);

  // Handle movement slider
  const handleMovementStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.changedTouches[0];
    if (!touch || movementTouchId.current !== null) return;

    movementTouchId.current = touch.identifier;
    const rect = movementRef.current?.getBoundingClientRect();
    if (rect) {
      movementCenter.current = rect.top + rect.height / 2;
    }
  }, []);

  const handleMovementMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    for (const touch of Array.from(e.changedTouches)) {
      if (touch.identifier === movementTouchId.current) {
        const dy = touch.clientY - movementCenter.current;

        const clampedY = Math.max(-SLIDER_MAX_OFFSET, Math.min(SLIDER_MAX_OFFSET, dy));
        setMovementKnobOffset(clampedY);

        // Invert: up = positive (forward), down = negative (backward), with dead zone
        const normalizedY = -clampedY / SLIDER_MAX_OFFSET;
        onMovementChange(Math.abs(normalizedY) < DEAD_ZONE ? 0 : normalizedY);
      }
    }
  }, [onMovementChange]);

  const handleMovementEnd = useCallback((e: React.TouchEvent) => {
    for (const touch of Array.from(e.changedTouches)) {
      if (touch.identifier === movementTouchId.current) {
        movementTouchId.current = null;
        setMovementKnobOffset(0);
        onMovementChange(0);
      }
    }
  }, [onMovementChange]);

  // Prevent default touch behavior on the joysticks
  useEffect(() => {
    const rotationEl = rotationRef.current;
    const movementEl = movementRef.current;

    const preventDefault = (e: TouchEvent) => e.preventDefault();

    rotationEl?.addEventListener('touchmove', preventDefault, { passive: false });
    movementEl?.addEventListener('touchmove', preventDefault, { passive: false });

    return () => {
      rotationEl?.removeEventListener('touchmove', preventDefault);
      movementEl?.removeEventListener('touchmove', preventDefault);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Teleport button - top left */}
      <button
        type="button"
        onClick={onTeleportNext}
        className="absolute top-4 left-20 z-50 flex items-center gap-2 px-3 py-2 bg-gold-600/90 hover:bg-gold-500 active:bg-gold-400 text-obsidian-950 rounded-lg backdrop-blur-sm shadow-lg"
      >
        <CompassIcon />
        <span className="text-sm font-medium">{t('galleryTour.nextArtwork', 'Next')}</span>
      </button>

      {/* Rotation joystick - bottom left */}
      <div
        ref={rotationRef}
        className="absolute bottom-8 left-6 z-50 touch-none"
        style={{ width: JOYSTICK_SIZE, height: JOYSTICK_SIZE }}
        onTouchStart={handleRotationStart}
        onTouchMove={handleRotationMove}
        onTouchEnd={handleRotationEnd}
        onTouchCancel={handleRotationEnd}
      >
        {/* Joystick base */}
        <div className="absolute inset-0 rounded-full bg-obsidian-800/70 border-2 border-obsidian-600 backdrop-blur-sm">
          {/* Direction indicators */}
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-obsidian-500"><RotateLeftIcon /></span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-obsidian-500"><RotateRightIcon /></span>
        </div>

        {/* Joystick knob */}
        <div
          className="absolute rounded-full bg-gradient-to-b from-gold-500 to-gold-600 shadow-lg border border-gold-400"
          style={{
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            left: JOYSTICK_SIZE / 2 - KNOB_SIZE / 2 + rotationKnobOffset.x,
            top: JOYSTICK_SIZE / 2 - KNOB_SIZE / 2 + rotationKnobOffset.y,
          }}
        />
      </div>

      {/* Movement slider - bottom right */}
      <div
        ref={movementRef}
        className="absolute bottom-8 right-6 z-50 touch-none"
        style={{ width: 60, height: SLIDER_HEIGHT }}
        onTouchStart={handleMovementStart}
        onTouchMove={handleMovementMove}
        onTouchEnd={handleMovementEnd}
        onTouchCancel={handleMovementEnd}
      >
        {/* Slider track */}
        <div className="absolute inset-x-0 top-2 bottom-2 mx-auto w-14 rounded-full bg-obsidian-800/70 border-2 border-obsidian-600 backdrop-blur-sm">
          {/* Direction indicators */}
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-obsidian-500"><ChevronUpIcon /></span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-obsidian-500"><ChevronDownIcon /></span>
        </div>

        {/* Slider knob */}
        <div
          className="absolute rounded-full bg-gradient-to-b from-gold-500 to-gold-600 shadow-lg border border-gold-400"
          style={{
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            left: 30 - KNOB_SIZE / 2,
            top: SLIDER_HEIGHT / 2 - KNOB_SIZE / 2 + movementKnobOffset,
          }}
        />
      </div>

      {/* Labels */}
      <div className="absolute bottom-2 left-6 z-50 text-obsidian-400 text-xs text-center" style={{ width: JOYSTICK_SIZE }}>
        {t('galleryTour.turnLabel', 'Turn')}
      </div>
      <div className="absolute bottom-2 right-6 z-50 text-obsidian-400 text-xs text-center" style={{ width: 60 }}>
        {t('galleryTour.moveLabel', 'Move')}
      </div>
    </>
  );
}

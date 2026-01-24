import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GALLERY_BOUNDS } from './GalleryRoom';

const MOVE_SPEED = 4;
const LOOK_SENSITIVITY = 0.003;
const PLAYER_HEIGHT = 1.7;
const JOYSTICK_SIZE = 120;

interface TouchControlsProps {
  enabled: boolean;
}

export function TouchControls({ enabled }: TouchControlsProps) {
  const { camera } = useThree();
  const moveVector = useRef({ x: 0, y: 0 });
  const lookDelta = useRef({ x: 0, y: 0 });
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const joystickTouchId = useRef<number | null>(null);
  const lookTouchId = useRef<number | null>(null);
  const joystickStartPos = useRef({ x: 0, y: 0 });
  const lastLookPos = useRef({ x: 0, y: 0 });

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    for (const touch of Array.from(e.changedTouches)) {
      const x = touch.clientX;
      const screenWidth = window.innerWidth;

      // Left side = joystick
      if (x < screenWidth / 2 && joystickTouchId.current === null) {
        joystickTouchId.current = touch.identifier;
        joystickStartPos.current = { x: touch.clientX, y: touch.clientY };
      }
      // Right side = look
      else if (x >= screenWidth / 2 && lookTouchId.current === null) {
        lookTouchId.current = touch.identifier;
        lastLookPos.current = { x: touch.clientX, y: touch.clientY };
      }
    }
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    for (const touch of Array.from(e.changedTouches)) {
      if (touch.identifier === joystickTouchId.current) {
        // Calculate joystick offset from initial touch
        const maxOffset = JOYSTICK_SIZE / 2;
        const dx = touch.clientX - joystickStartPos.current.x;
        const dy = touch.clientY - joystickStartPos.current.y;
        moveVector.current.x = Math.max(-1, Math.min(1, dx / maxOffset));
        moveVector.current.y = Math.max(-1, Math.min(1, dy / maxOffset));
      }

      if (touch.identifier === lookTouchId.current) {
        const dx = touch.clientX - lastLookPos.current.x;
        const dy = touch.clientY - lastLookPos.current.y;
        lookDelta.current.x = -dx * LOOK_SENSITIVITY;
        lookDelta.current.y = -dy * LOOK_SENSITIVITY;
        lastLookPos.current = { x: touch.clientX, y: touch.clientY };
      }
    }
  }, [enabled]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    for (const touch of Array.from(e.changedTouches)) {
      if (touch.identifier === joystickTouchId.current) {
        joystickTouchId.current = null;
        moveVector.current = { x: 0, y: 0 };
      }
      if (touch.identifier === lookTouchId.current) {
        lookTouchId.current = null;
        lookDelta.current = { x: 0, y: 0 };
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  useFrame((_, delta) => {
    if (!enabled) return;

    // Look
    if (lookDelta.current.x !== 0 || lookDelta.current.y !== 0) {
      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y += lookDelta.current.x;
      euler.current.x += lookDelta.current.y;
      euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
      // Reset delta after applying
      lookDelta.current = { x: 0, y: 0 };
    }

    // Move
    const speed = MOVE_SPEED * delta;
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(direction, camera.up).normalize();

    const newPosition = camera.position.clone();

    newPosition.addScaledVector(direction, -moveVector.current.y * speed);
    newPosition.addScaledVector(right, moveVector.current.x * speed);

    // Clamp to bounds
    newPosition.x = Math.max(GALLERY_BOUNDS.minX, Math.min(GALLERY_BOUNDS.maxX, newPosition.x));
    newPosition.z = Math.max(GALLERY_BOUNDS.minZ, Math.min(GALLERY_BOUNDS.maxZ, newPosition.z));
    newPosition.y = PLAYER_HEIGHT;

    camera.position.copy(newPosition);
  });

  return null;
}

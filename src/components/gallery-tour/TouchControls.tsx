import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GALLERY_BOUNDS } from './GalleryRoom';

const MOVE_SPEED = 4;
const ROTATION_SPEED = 2;
const PLAYER_HEIGHT = 1.7;

interface TouchControlsProps {
  enabled: boolean;
  rotationInput: number; // -1 to 1
  movementInput: number; // -1 to 1
  teleportTarget: [number, number, number] | null;
  onTeleportComplete: () => void;
}

export function TouchControls({
  enabled,
  rotationInput,
  movementInput,
  teleportTarget,
  onTeleportComplete,
}: TouchControlsProps) {
  const { camera } = useThree();
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  // Reusable vectors to avoid GC pressure at 60fps
  const direction = useRef(new THREE.Vector3());
  const newPosition = useRef(new THREE.Vector3());

  // Handle teleportation
  useEffect(() => {
    if (teleportTarget && enabled) {
      // Get direction to face the artifact (look at the frame position)
      const [targetX, , targetZ] = teleportTarget;

      // Position player 3 units away from the frame, facing it
      const dirX = targetX > 0 ? -1 : targetX < 0 ? 1 : 0;
      const dirZ = targetZ > 0 ? -1 : targetZ < 0 ? 1 : 0;

      // Calculate position in front of the frame
      let newX = targetX;
      let newZ = targetZ;

      // Move player away from the wall
      if (Math.abs(targetX) > 15) {
        // East or West wall
        newX = targetX + dirX * 3;
      } else if (Math.abs(targetZ) > 13) {
        // North or South wall
        newZ = targetZ + dirZ * 3;
      }

      // Clamp to bounds
      newX = Math.max(GALLERY_BOUNDS.minX, Math.min(GALLERY_BOUNDS.maxX, newX));
      newZ = Math.max(GALLERY_BOUNDS.minZ, Math.min(GALLERY_BOUNDS.maxZ, newZ));

      // Set camera position
      camera.position.set(newX, PLAYER_HEIGHT, newZ);

      // Look at the frame
      const lookAtPos = new THREE.Vector3(targetX, PLAYER_HEIGHT, targetZ);
      camera.lookAt(lookAtPos);

      // Update euler from new camera orientation
      euler.current.setFromQuaternion(camera.quaternion);

      onTeleportComplete();
    }
  }, [teleportTarget, enabled, camera, onTeleportComplete]);

  useFrame((_, delta) => {
    if (!enabled) return;

    // Rotation (turning left/right)
    if (rotationInput !== 0) {
      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= rotationInput * ROTATION_SPEED * delta;
      camera.quaternion.setFromEuler(euler.current);
    }

    // Movement (forward/backward)
    if (movementInput !== 0) {
      const speed = MOVE_SPEED * delta;
      camera.getWorldDirection(direction.current);
      direction.current.y = 0;
      direction.current.normalize();

      newPosition.current.copy(camera.position);
      newPosition.current.addScaledVector(direction.current, movementInput * speed);

      // Clamp to bounds
      newPosition.current.x = Math.max(GALLERY_BOUNDS.minX, Math.min(GALLERY_BOUNDS.maxX, newPosition.current.x));
      newPosition.current.z = Math.max(GALLERY_BOUNDS.minZ, Math.min(GALLERY_BOUNDS.maxZ, newPosition.current.z));
      newPosition.current.y = PLAYER_HEIGHT;

      camera.position.copy(newPosition.current);
    }
  });

  return null;
}

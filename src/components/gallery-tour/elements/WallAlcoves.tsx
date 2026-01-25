import { useMemo, useEffect } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const WALL_TEXTURE_URL = '/textures/white_plaster_02_diff_1k.jpg';

// Alcove dimensions
const ALCOVE_DEPTH = 2;
const ALCOVE_WIDTH = 4;
const ALCOVE_HEIGHT = 4;
const WALL_THICKNESS = 0.2;

// Room dimensions (from GalleryRoom)
const ROOM_WIDTH = 32;
const ROOM_HEIGHT = 8;

// Alcove positions along the z-axis
const ALCOVE_POSITIONS_Z = [-6, 4];

interface AlcoveProps {
  position: [number, number, number];
  rotation: number;
  material: THREE.MeshStandardMaterial;
}

function Alcove({ position, rotation, material }: AlcoveProps) {
  // Alcove consists of:
  // - Back wall (inside the alcove)
  // - Two side walls (partial walls creating the alcove opening)
  // - Top wall (ceiling of alcove)
  // - Bottom wall (floor of alcove, optional)

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Back wall of alcove */}
      <mesh position={[0, ALCOVE_HEIGHT / 2, -ALCOVE_DEPTH / 2]} receiveShadow>
        <boxGeometry args={[ALCOVE_WIDTH, ALCOVE_HEIGHT, WALL_THICKNESS]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Left side wall */}
      <mesh
        position={[-ALCOVE_WIDTH / 2, ALCOVE_HEIGHT / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[ALCOVE_DEPTH, ALCOVE_HEIGHT, WALL_THICKNESS]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Right side wall */}
      <mesh
        position={[ALCOVE_WIDTH / 2, ALCOVE_HEIGHT / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[ALCOVE_DEPTH, ALCOVE_HEIGHT, WALL_THICKNESS]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Top wall (alcove ceiling) */}
      <mesh position={[0, ALCOVE_HEIGHT, -ALCOVE_DEPTH / 4]} receiveShadow>
        <boxGeometry args={[ALCOVE_WIDTH, WALL_THICKNESS, ALCOVE_DEPTH / 2]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

export function WallAlcoves() {
  const wallTexture = useTexture(WALL_TEXTURE_URL);

  // Configure texture for repeating
  useEffect(() => {
    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(2, 2);
    wallTexture.colorSpace = THREE.SRGBColorSpace;
    wallTexture.needsUpdate = true;
  }, [wallTexture]);

  const wallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: wallTexture,
        roughness: 0.9,
      }),
    [wallTexture]
  );

  // Dispose materials on unmount to free GPU memory
  useEffect(() => {
    return () => {
      wallMaterial.dispose();
    };
  }, [wallMaterial]);

  // Calculate alcove positions
  // West wall is at x = -ROOM_WIDTH/2, alcoves extend inward (positive x direction)
  // East wall is at x = ROOM_WIDTH/2, alcoves extend inward (negative x direction)
  const westWallX = -ROOM_WIDTH / 2;
  const eastWallX = ROOM_WIDTH / 2;

  return (
    <group>
      {/* West wall alcoves (2 alcoves) */}
      {ALCOVE_POSITIONS_Z.map((z) => (
        <Alcove
          key={`west-alcove-${z}`}
          position={[westWallX + ALCOVE_DEPTH / 2, 0, z]}
          rotation={Math.PI / 2}
          material={wallMaterial}
        />
      ))}

      {/* East wall alcoves (2 alcoves) */}
      {ALCOVE_POSITIONS_Z.map((z) => (
        <Alcove
          key={`east-alcove-${z}`}
          position={[eastWallX - ALCOVE_DEPTH / 2, 0, z]}
          rotation={-Math.PI / 2}
          material={wallMaterial}
        />
      ))}
    </group>
  );
}

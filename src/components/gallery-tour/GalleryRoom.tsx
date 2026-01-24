import { useMemo, useEffect } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// CC0 textures from Poly Haven
const FLOOR_TEXTURE_URL = 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/diagonal_parquet/diagonal_parquet_diff_2k.jpg';
const WALL_TEXTURE_URL = 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/plaster_brick_pattern/plaster_brick_pattern_diff_2k.jpg';
const CEILING_TEXTURE_URL = 'https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k/marble_01/marble_01_diff_2k.jpg';

const ROOM_WIDTH = 32;
const ROOM_DEPTH = 28;
const ROOM_HEIGHT = 8;
const WALL_THICKNESS = 0.2;
const DOOR_WIDTH = 2.5;
const DOOR_HEIGHT = 3.5;

export function GalleryRoom() {
  // Load textures using drei's useTexture hook
  const floorTexture = useTexture(FLOOR_TEXTURE_URL);
  const wallTexture = useTexture(WALL_TEXTURE_URL);
  const ceilingTexture = useTexture(CEILING_TEXTURE_URL);

  // Configure floor texture for repeating (room is 32x28 units)
  useEffect(() => {
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(ROOM_WIDTH / 2, ROOM_DEPTH / 2);
    floorTexture.colorSpace = THREE.SRGBColorSpace;
    floorTexture.needsUpdate = true;
  }, [floorTexture]);

  // Configure wall texture for repeating
  useEffect(() => {
    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(16, 4);
    wallTexture.colorSpace = THREE.SRGBColorSpace;
    wallTexture.needsUpdate = true;
  }, [wallTexture]);

  // Configure ceiling texture for repeating
  useEffect(() => {
    ceilingTexture.wrapS = ceilingTexture.wrapT = THREE.RepeatWrapping;
    ceilingTexture.repeat.set(ROOM_WIDTH / 4, ROOM_DEPTH / 4);
    ceilingTexture.colorSpace = THREE.SRGBColorSpace;
    ceilingTexture.needsUpdate = true;
  }, [ceilingTexture]);

  const floorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: floorTexture,
        roughness: 0.8,
      }),
    [floorTexture]
  );

  const wallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: wallTexture,
        roughness: 0.9,
      }),
    [wallTexture]
  );

  const ceilingMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: ceilingTexture,
        roughness: 0.3,
        metalness: 0.1,
      }),
    [ceilingTexture]
  );

  // Dispose materials on unmount to free GPU memory
  useEffect(() => {
    return () => {
      floorMaterial.dispose();
      wallMaterial.dispose();
      ceilingMaterial.dispose();
    };
  }, [floorMaterial, wallMaterial, ceilingMaterial]);

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <primitive object={ceilingMaterial} attach="material" />
      </mesh>

      {/* North Wall (back) */}
      <mesh position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]} receiveShadow>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, WALL_THICKNESS]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      {/* South Wall (front with door) */}
      {/* Left section of south wall */}
      <mesh position={[-(ROOM_WIDTH / 4 + DOOR_WIDTH / 4), ROOM_HEIGHT / 2, ROOM_DEPTH / 2]} receiveShadow>
        <boxGeometry args={[ROOM_WIDTH / 2 - DOOR_WIDTH / 2, ROOM_HEIGHT, WALL_THICKNESS]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>
      {/* Right section of south wall */}
      <mesh position={[(ROOM_WIDTH / 4 + DOOR_WIDTH / 4), ROOM_HEIGHT / 2, ROOM_DEPTH / 2]} receiveShadow>
        <boxGeometry args={[ROOM_WIDTH / 2 - DOOR_WIDTH / 2, ROOM_HEIGHT, WALL_THICKNESS]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>
      {/* Section above door */}
      <mesh position={[0, DOOR_HEIGHT + (ROOM_HEIGHT - DOOR_HEIGHT) / 2, ROOM_DEPTH / 2]} receiveShadow>
        <boxGeometry args={[DOOR_WIDTH, ROOM_HEIGHT - DOOR_HEIGHT, WALL_THICKNESS]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      {/* Door frame */}
      <mesh position={[-DOOR_WIDTH / 2 - 0.05, DOOR_HEIGHT / 2, ROOM_DEPTH / 2 + 0.05]}>
        <boxGeometry args={[0.1, DOOR_HEIGHT, 0.15]} />
        <meshStandardMaterial color="#4a3728" roughness={0.6} />
      </mesh>
      <mesh position={[DOOR_WIDTH / 2 + 0.05, DOOR_HEIGHT / 2, ROOM_DEPTH / 2 + 0.05]}>
        <boxGeometry args={[0.1, DOOR_HEIGHT, 0.15]} />
        <meshStandardMaterial color="#4a3728" roughness={0.6} />
      </mesh>
      <mesh position={[0, DOOR_HEIGHT + 0.05, ROOM_DEPTH / 2 + 0.05]}>
        <boxGeometry args={[DOOR_WIDTH + 0.2, 0.1, 0.15]} />
        <meshStandardMaterial color="#4a3728" roughness={0.6} />
      </mesh>

      {/* Door (closed) */}
      <mesh position={[0, DOOR_HEIGHT / 2, ROOM_DEPTH / 2 + 0.06]}>
        <boxGeometry args={[DOOR_WIDTH - 0.1, DOOR_HEIGHT - 0.1, 0.08]} />
        <meshStandardMaterial color="#5c4033" roughness={0.7} />
      </mesh>
      {/* Door panels - decorative */}
      <mesh position={[0, DOOR_HEIGHT * 0.7, ROOM_DEPTH / 2 + 0.11]}>
        <boxGeometry args={[DOOR_WIDTH * 0.7, DOOR_HEIGHT * 0.35, 0.02]} />
        <meshStandardMaterial color="#4a3525" roughness={0.6} />
      </mesh>
      <mesh position={[0, DOOR_HEIGHT * 0.3, ROOM_DEPTH / 2 + 0.11]}>
        <boxGeometry args={[DOOR_WIDTH * 0.7, DOOR_HEIGHT * 0.35, 0.02]} />
        <meshStandardMaterial color="#4a3525" roughness={0.6} />
      </mesh>
      {/* Door handle */}
      <mesh position={[DOOR_WIDTH * 0.35, DOOR_HEIGHT / 2, ROOM_DEPTH / 2 + 0.15]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* East Wall (right) */}
      <mesh position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[ROOM_DEPTH, ROOM_HEIGHT, WALL_THICKNESS]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      {/* West Wall (left) */}
      <mesh position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[ROOM_DEPTH, ROOM_HEIGHT, WALL_THICKNESS]} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>

      {/* Ambient lighting - increased for brighter room */}
      <ambientLight intensity={0.6} color="#FFF8DC" />

      {/* Main directional light */}
      <directionalLight
        position={[5, ROOM_HEIGHT - 0.5, 5]}
        intensity={0.8}
        color="#FFFFFF"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Fill light */}
      <directionalLight
        position={[-5, ROOM_HEIGHT - 0.5, -5]}
        intensity={0.5}
        color="#E6E6FA"
      />

      {/* Ceiling light fixtures - 3 rows of 3 */}
      {[-8, 0, 8].map((x) =>
        [-8, 0, 8].map((z) => (
          <group key={`light-${x}-${z}`} position={[x, ROOM_HEIGHT - 0.1, z]}>
            {/* Light fixture housing */}
            <mesh>
              <cylinderGeometry args={[0.3, 0.4, 0.15, 16]} />
              <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Light bulb glow */}
            <mesh position={[0, -0.1, 0]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshBasicMaterial color="#FFF8DC" />
            </mesh>
            {/* Point light for actual illumination */}
            <pointLight
              position={[0, -0.3, 0]}
              intensity={1.5}
              distance={15}
              color="#FFF8DC"
              decay={2}
            />
          </group>
        ))
      )}

      {/* Fog for depth - lighter for brighter room */}
      <fog attach="fog" args={['#2a2a3e', 35, 80]} />
    </group>
  );
}

export const GALLERY_BOUNDS = {
  minX: -ROOM_WIDTH / 2 + 0.5,
  maxX: ROOM_WIDTH / 2 - 0.5,
  minZ: -ROOM_DEPTH / 2 + 0.5,
  maxZ: ROOM_DEPTH / 2 - 0.5,
};

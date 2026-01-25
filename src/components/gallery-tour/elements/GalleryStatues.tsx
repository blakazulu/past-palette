import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Colors
const SANDSTONE = '#C9B896';
const DARK_STONE = '#2A2A2A';

/**
 * Sphinx statue component - low-poly box-based sphinx shape
 */
function Sphinx({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    return () => {
      materialsRef.current.forEach((mat) => mat.dispose());
      materialsRef.current = [];
    };
  }, []);

  const createMaterial = () => {
    const mat = new THREE.MeshStandardMaterial({ color: SANDSTONE });
    materialsRef.current.push(mat);
    return mat;
  };

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      {/* Base platform */}
      <mesh position={[0, 0.15, 0]} material={createMaterial()}>
        <boxGeometry args={[2.5, 0.3, 1.8]} />
      </mesh>

      {/* Body - main rectangular shape */}
      <mesh position={[0, 0.7, 0]} material={createMaterial()}>
        <boxGeometry args={[2, 0.8, 1.2]} />
      </mesh>

      {/* Front legs - extended forward */}
      <mesh position={[0.8, 0.4, 0.3]} material={createMaterial()}>
        <boxGeometry args={[1.2, 0.4, 0.3]} />
      </mesh>
      <mesh position={[0.8, 0.4, -0.3]} material={createMaterial()}>
        <boxGeometry args={[1.2, 0.4, 0.3]} />
      </mesh>

      {/* Head */}
      <mesh position={[1.2, 1.3, 0]} material={createMaterial()}>
        <boxGeometry args={[0.6, 0.7, 0.5]} />
      </mesh>

      {/* Headdress (nemes) - trapezoidal shape approximated with boxes */}
      <mesh position={[1.2, 1.5, 0]} material={createMaterial()}>
        <boxGeometry args={[0.5, 0.4, 0.7]} />
      </mesh>
      {/* Headdress sides */}
      <mesh position={[1.0, 1.1, 0.35]} rotation={[0, 0, -0.3]} material={createMaterial()}>
        <boxGeometry args={[0.3, 0.5, 0.15]} />
      </mesh>
      <mesh position={[1.0, 1.1, -0.35]} rotation={[0, 0, -0.3]} material={createMaterial()}>
        <boxGeometry args={[0.3, 0.5, 0.15]} />
      </mesh>
    </group>
  );
}

/**
 * Anubis statue - standing figure with jackal head
 */
function Anubis({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    return () => {
      materialsRef.current.forEach((mat) => mat.dispose());
      materialsRef.current = [];
    };
  }, []);

  const createDarkMaterial = () => {
    const mat = new THREE.MeshStandardMaterial({ color: DARK_STONE });
    materialsRef.current.push(mat);
    return mat;
  };

  const createSandstoneMaterial = () => {
    const mat = new THREE.MeshStandardMaterial({ color: SANDSTONE });
    materialsRef.current.push(mat);
    return mat;
  };

  return (
    <group ref={groupRef} position={position}>
      {/* Sandstone base */}
      <mesh position={[0, 0.2, 0]} material={createSandstoneMaterial()}>
        <boxGeometry args={[1.2, 0.4, 1.2]} />
      </mesh>

      {/* Legs */}
      <mesh position={[0.2, 1.0, 0]} material={createDarkMaterial()}>
        <boxGeometry args={[0.25, 1.6, 0.3]} />
      </mesh>
      <mesh position={[-0.2, 1.0, 0]} material={createDarkMaterial()}>
        <boxGeometry args={[0.25, 1.6, 0.3]} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 2.2, 0]} material={createDarkMaterial()}>
        <boxGeometry args={[0.7, 1.0, 0.4]} />
      </mesh>

      {/* Arms - crossed or at sides */}
      <mesh position={[0.45, 2.1, 0]} rotation={[0, 0, 0.2]} material={createDarkMaterial()}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
      </mesh>
      <mesh position={[-0.45, 2.1, 0]} rotation={[0, 0, -0.2]} material={createDarkMaterial()}>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
      </mesh>

      {/* Jackal head - elongated snout */}
      <mesh position={[0, 2.9, 0]} material={createDarkMaterial()}>
        <boxGeometry args={[0.4, 0.5, 0.35]} />
      </mesh>
      {/* Snout */}
      <mesh position={[0, 2.85, 0.3]} material={createDarkMaterial()}>
        <boxGeometry args={[0.2, 0.25, 0.4]} />
      </mesh>

      {/* Ears - tall and pointed */}
      <mesh position={[0.15, 3.35, -0.05]} rotation={[0.2, 0, 0.1]} material={createDarkMaterial()}>
        <boxGeometry args={[0.1, 0.4, 0.15]} />
      </mesh>
      <mesh position={[-0.15, 3.35, -0.05]} rotation={[0.2, 0, -0.1]} material={createDarkMaterial()}>
        <boxGeometry args={[0.1, 0.4, 0.15]} />
      </mesh>
    </group>
  );
}

/**
 * Lion statue - sitting lion with mane
 */
function Lion({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    return () => {
      materialsRef.current.forEach((mat) => mat.dispose());
      materialsRef.current = [];
    };
  }, []);

  const createMaterial = () => {
    const mat = new THREE.MeshStandardMaterial({ color: SANDSTONE });
    materialsRef.current.push(mat);
    return mat;
  };

  return (
    <group ref={groupRef} position={position} rotation={[0, -Math.PI / 2, 0]}>
      {/* Base platform */}
      <mesh position={[0, 0.15, 0]} material={createMaterial()}>
        <boxGeometry args={[2, 0.3, 1.4]} />
      </mesh>

      {/* Haunches - sitting position */}
      <mesh position={[-0.4, 0.6, 0]} material={createMaterial()}>
        <boxGeometry args={[1.0, 0.6, 1.0]} />
      </mesh>

      {/* Front legs - upright */}
      <mesh position={[0.5, 0.7, 0.25]} material={createMaterial()}>
        <boxGeometry args={[0.5, 1.0, 0.3]} />
      </mesh>
      <mesh position={[0.5, 0.7, -0.25]} material={createMaterial()}>
        <boxGeometry args={[0.5, 1.0, 0.3]} />
      </mesh>

      {/* Chest */}
      <mesh position={[0.3, 1.3, 0]} material={createMaterial()}>
        <boxGeometry args={[0.7, 0.8, 0.8]} />
      </mesh>

      {/* Mane - sphere around head */}
      <mesh position={[0.5, 1.8, 0]} material={createMaterial()}>
        <sphereGeometry args={[0.55, 8, 8]} />
      </mesh>

      {/* Head - smaller sphere inside mane area */}
      <mesh position={[0.7, 1.8, 0]} material={createMaterial()}>
        <boxGeometry args={[0.4, 0.4, 0.35]} />
      </mesh>

      {/* Snout */}
      <mesh position={[0.95, 1.7, 0]} material={createMaterial()}>
        <boxGeometry args={[0.2, 0.2, 0.25]} />
      </mesh>

      {/* Tail - curved back */}
      <mesh position={[-0.9, 0.7, 0]} rotation={[0, 0, 0.5]} material={createMaterial()}>
        <boxGeometry args={[0.6, 0.15, 0.15]} />
      </mesh>
      <mesh position={[-1.1, 0.9, 0]} rotation={[0, 0, 1.2]} material={createMaterial()}>
        <boxGeometry args={[0.4, 0.12, 0.12]} />
      </mesh>
    </group>
  );
}

/**
 * GalleryStatues - Collection of all statues in the gallery
 * - 2 Sphinxes flanking central pedestal
 * - 1 Anubis in left alcove
 * - 1 Lion in right alcove
 */
export function GalleryStatues() {
  return (
    <group>
      {/* Sphinxes flanking central pedestal */}
      <Sphinx position={[-5, 0, -2]} rotation={Math.PI / 6} />
      <Sphinx position={[5, 0, -2]} rotation={-Math.PI / 6} />

      {/* Anubis in left alcove */}
      <Anubis position={[-13.5, 0, -6]} />

      {/* Lion in right alcove */}
      <Lion position={[13.5, 0, 4]} />
    </group>
  );
}

import { useMemo, useEffect } from 'react';
import * as THREE from 'three';

// Colors
const SANDSTONE = '#C9B896';
const DARK_STONE = '#2A2A2A';

/**
 * Sphinx statue component - low-poly box-based sphinx shape
 */
function Sphinx({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: SANDSTONE, roughness: 0.85 }),
    []
  );

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Base platform */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[2.5, 0.3, 1.8]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Body - main rectangular shape */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[2, 0.8, 1.2]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Front legs - extended forward */}
      <mesh position={[0.8, 0.4, 0.3]} castShadow>
        <boxGeometry args={[1.2, 0.4, 0.3]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[0.8, 0.4, -0.3]} castShadow>
        <boxGeometry args={[1.2, 0.4, 0.3]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Head */}
      <mesh position={[1.2, 1.3, 0]} castShadow>
        <boxGeometry args={[0.6, 0.7, 0.5]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Headdress (nemes) - trapezoidal shape approximated with boxes */}
      <mesh position={[1.2, 1.5, 0]} castShadow>
        <boxGeometry args={[0.5, 0.4, 0.7]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Headdress sides */}
      <mesh position={[1.0, 1.1, 0.35]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[0.3, 0.5, 0.15]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[1.0, 1.1, -0.35]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[0.3, 0.5, 0.15]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

/**
 * Anubis statue - standing figure with jackal head
 */
function Anubis({ position }: { position: [number, number, number] }) {
  const darkMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: DARK_STONE, roughness: 0.7 }),
    []
  );

  const sandstoneMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: SANDSTONE, roughness: 0.85 }),
    []
  );

  useEffect(() => {
    return () => {
      darkMaterial.dispose();
      sandstoneMaterial.dispose();
    };
  }, [darkMaterial, sandstoneMaterial]);

  return (
    <group position={position}>
      {/* Sandstone base */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[1.2, 0.4, 1.2]} />
        <primitive object={sandstoneMaterial} attach="material" />
      </mesh>

      {/* Legs */}
      <mesh position={[0.2, 1.0, 0]} castShadow>
        <boxGeometry args={[0.25, 1.6, 0.3]} />
        <primitive object={darkMaterial} attach="material" />
      </mesh>
      <mesh position={[-0.2, 1.0, 0]} castShadow>
        <boxGeometry args={[0.25, 1.6, 0.3]} />
        <primitive object={darkMaterial} attach="material" />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <boxGeometry args={[0.7, 1.0, 0.4]} />
        <primitive object={darkMaterial} attach="material" />
      </mesh>

      {/* Arms - crossed or at sides */}
      <mesh position={[0.45, 2.1, 0]} rotation={[0, 0, 0.2]} castShadow>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <primitive object={darkMaterial} attach="material" />
      </mesh>
      <mesh position={[-0.45, 2.1, 0]} rotation={[0, 0, -0.2]} castShadow>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <primitive object={darkMaterial} attach="material" />
      </mesh>

      {/* Jackal head - elongated snout */}
      <mesh position={[0, 2.9, 0]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.35]} />
        <primitive object={darkMaterial} attach="material" />
      </mesh>
      {/* Snout */}
      <mesh position={[0, 2.85, 0.3]} castShadow>
        <boxGeometry args={[0.2, 0.25, 0.4]} />
        <primitive object={darkMaterial} attach="material" />
      </mesh>

      {/* Ears - tall and pointed */}
      <mesh position={[0.15, 3.35, -0.05]} rotation={[0.2, 0, 0.1]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.15]} />
        <primitive object={darkMaterial} attach="material" />
      </mesh>
      <mesh position={[-0.15, 3.35, -0.05]} rotation={[0.2, 0, -0.1]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.15]} />
        <primitive object={darkMaterial} attach="material" />
      </mesh>
    </group>
  );
}

/**
 * Lion statue - sitting lion with mane
 */
function Lion({ position }: { position: [number, number, number] }) {
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: SANDSTONE, roughness: 0.85 }),
    []
  );

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return (
    <group position={position} rotation={[0, -Math.PI / 2, 0]}>
      {/* Base platform */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[2, 0.3, 1.4]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Haunches - sitting position */}
      <mesh position={[-0.4, 0.6, 0]} castShadow>
        <boxGeometry args={[1.0, 0.6, 1.0]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Front legs - upright */}
      <mesh position={[0.5, 0.7, 0.25]} castShadow>
        <boxGeometry args={[0.5, 1.0, 0.3]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[0.5, 0.7, -0.25]} castShadow>
        <boxGeometry args={[0.5, 1.0, 0.3]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Chest */}
      <mesh position={[0.3, 1.3, 0]} castShadow>
        <boxGeometry args={[0.7, 0.8, 0.8]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Mane - sphere around head */}
      <mesh position={[0.5, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.55, 8, 8]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Head - smaller sphere inside mane area */}
      <mesh position={[0.7, 1.8, 0]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.35]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Snout */}
      <mesh position={[0.95, 1.7, 0]} castShadow>
        <boxGeometry args={[0.2, 0.2, 0.25]} />
        <primitive object={material} attach="material" />
      </mesh>

      {/* Tail - curved back */}
      <mesh position={[-0.9, 0.7, 0]} rotation={[0, 0, 0.5]} castShadow>
        <boxGeometry args={[0.6, 0.15, 0.15]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[-1.1, 0.9, 0]} rotation={[0, 0, 1.2]} castShadow>
        <boxGeometry args={[0.4, 0.12, 0.12]} />
        <primitive object={material} attach="material" />
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

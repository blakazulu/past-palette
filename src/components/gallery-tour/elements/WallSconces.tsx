import { useEffect, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Bronze PBR texture paths
const BRONZE_DIFF_URL = '/textures/bronze_diff.jpg';
const BRONZE_ROUGHNESS_URL = '/textures/bronze_roughness.jpg';
const BRONZE_METALNESS_URL = '/textures/bronze_metalness.jpg';
const BRONZE_NORMAL_URL = '/textures/bronze_normal.jpg';

// Point light configuration for sconces
const SCONCE_LIGHT_CONFIG = {
  color: '#FFE4B5', // Warm moccasin
  intensity: 0.8,
  distance: 8,
  decay: 2,
};

// Sconce height on wall
const SCONCE_HEIGHT = 3;

// Wall positions
const ROOM_HALF_WIDTH = 16;
const ROOM_HALF_DEPTH = 14;

interface SconceProps {
  position: [number, number, number];
  rotation: [number, number, number];
}

function TorchSconce({ position, rotation }: SconceProps) {
  // Load bronze PBR textures
  const [diffuseMap, roughnessMap, metalnessMap, normalMap] = useTexture([
    BRONZE_DIFF_URL,
    BRONZE_ROUGHNESS_URL,
    BRONZE_METALNESS_URL,
    BRONZE_NORMAL_URL,
  ]);

  // Configure textures
  useEffect(() => {
    diffuseMap.colorSpace = THREE.SRGBColorSpace;
    diffuseMap.needsUpdate = true;
  }, [diffuseMap]);

  // Bronze material with PBR textures
  const bronzeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: diffuseMap,
      roughnessMap: roughnessMap,
      metalnessMap: metalnessMap,
      normalMap: normalMap,
      roughness: 0.5,
      metalness: 0.9,
    });
  }, [diffuseMap, roughnessMap, metalnessMap, normalMap]);

  // Flame emissive material
  const flameMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#FF6B00',
      emissive: '#FF4500',
      emissiveIntensity: 2,
      transparent: true,
      opacity: 0.9,
    });
  }, []);

  // Flame glow material (outer)
  const flameGlowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#FFAA00',
      transparent: true,
      opacity: 0.4,
    });
  }, []);

  // Geometries
  const wallPlateGeometry = useMemo(() => {
    return new THREE.BoxGeometry(0.15, 0.25, 0.04);
  }, []);

  const bracketArmGeometry = useMemo(() => {
    // Curved bracket arm using a tube
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -0.05, 0.1),
      new THREE.Vector3(0, -0.02, 0.2),
      new THREE.Vector3(0, 0.05, 0.28),
    ]);
    return new THREE.TubeGeometry(curve, 12, 0.025, 8, false);
  }, []);

  const torchHolderGeometry = useMemo(() => {
    // Small cup/cylinder to hold the torch
    return new THREE.CylinderGeometry(0.06, 0.04, 0.1, 12);
  }, []);

  const torchBodyGeometry = useMemo(() => {
    // The torch shaft
    return new THREE.CylinderGeometry(0.03, 0.035, 0.2, 8);
  }, []);

  const flameGeometry = useMemo(() => {
    // Flame shape using a cone
    return new THREE.ConeGeometry(0.05, 0.15, 8);
  }, []);

  const flameGlowGeometry = useMemo(() => {
    // Outer glow sphere
    return new THREE.SphereGeometry(0.08, 16, 16);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      bronzeMaterial.dispose();
      flameMaterial.dispose();
      flameGlowMaterial.dispose();
      wallPlateGeometry.dispose();
      bracketArmGeometry.dispose();
      torchHolderGeometry.dispose();
      torchBodyGeometry.dispose();
      flameGeometry.dispose();
      flameGlowGeometry.dispose();
    };
  }, [
    bronzeMaterial,
    flameMaterial,
    flameGlowMaterial,
    wallPlateGeometry,
    bracketArmGeometry,
    torchHolderGeometry,
    torchBodyGeometry,
    flameGeometry,
    flameGlowGeometry,
  ]);

  return (
    <group position={position} rotation={rotation}>
      {/* Wall mounting plate */}
      <mesh geometry={wallPlateGeometry} material={bronzeMaterial} position={[0, 0, 0]} />

      {/* Curved bracket arm */}
      <mesh geometry={bracketArmGeometry} material={bronzeMaterial} position={[0, 0, 0.02]} />

      {/* Torch holder cup */}
      <mesh
        geometry={torchHolderGeometry}
        material={bronzeMaterial}
        position={[0, 0.05, 0.28]}
        rotation={[0.1, 0, 0]}
      />

      {/* Torch body */}
      <mesh
        geometry={torchBodyGeometry}
        material={bronzeMaterial}
        position={[0, 0.18, 0.29]}
        rotation={[0.1, 0, 0]}
      />

      {/* Flame */}
      <mesh
        geometry={flameGeometry}
        material={flameMaterial}
        position={[0, 0.35, 0.3]}
      />

      {/* Flame glow */}
      <mesh
        geometry={flameGlowGeometry}
        material={flameGlowMaterial}
        position={[0, 0.32, 0.3]}
      />

      {/* Point light for illumination */}
      <pointLight
        position={[0, 0.3, 0.3]}
        color={SCONCE_LIGHT_CONFIG.color}
        intensity={SCONCE_LIGHT_CONFIG.intensity}
        distance={SCONCE_LIGHT_CONFIG.distance}
        decay={SCONCE_LIGHT_CONFIG.decay}
      />
    </group>
  );
}

export function WallSconces() {
  // Sconce positions and rotations
  // Each sconce needs to face into the room

  const sconceConfigs: { position: [number, number, number]; rotation: [number, number, number] }[] = useMemo(() => {
    const configs: { position: [number, number, number]; rotation: [number, number, number] }[] = [];

    // North wall (z = -14): facing south (rotation 0)
    const northX = [-10, -3, 3, 10];
    for (const x of northX) {
      configs.push({
        position: [x, SCONCE_HEIGHT, -ROOM_HALF_DEPTH],
        rotation: [0, 0, 0], // Facing into room (positive Z)
      });
    }

    // South wall (z = 14): facing north (rotation PI)
    const southX = [-10, -3, 3, 10];
    for (const x of southX) {
      configs.push({
        position: [x, SCONCE_HEIGHT, ROOM_HALF_DEPTH],
        rotation: [0, Math.PI, 0], // Facing into room (negative Z)
      });
    }

    // East wall (x = 16): facing west (rotation -PI/2)
    const eastZ = [-5, 5];
    for (const z of eastZ) {
      configs.push({
        position: [ROOM_HALF_WIDTH, SCONCE_HEIGHT, z],
        rotation: [0, -Math.PI / 2, 0], // Facing into room (negative X)
      });
    }

    // West wall (x = -16): facing east (rotation PI/2)
    const westZ = [-5, 5];
    for (const z of westZ) {
      configs.push({
        position: [-ROOM_HALF_WIDTH, SCONCE_HEIGHT, z],
        rotation: [0, Math.PI / 2, 0], // Facing into room (positive X)
      });
    }

    return configs;
  }, []);

  return (
    <group name="wall-sconces">
      {sconceConfigs.map((config, index) => (
        <TorchSconce
          key={`sconce-${index}`}
          position={config.position}
          rotation={config.rotation}
        />
      ))}
    </group>
  );
}

import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const CHANDELIER_MODEL_PATH = '/models/Chandelier_01_1k.gltf';

// Point light configuration for chandelier lamps
const LAMP_LIGHT_CONFIG = {
  color: '#FFE4B5', // Warm moccasin color
  intensity: 2.5,
  distance: 20,
  decay: 2,
};

// 6 lamp positions arranged in a circle around the chandelier
// Spread lights wider to illuminate more of the room
const LAMP_RADIUS = 1.6;
const LAMP_HEIGHT_OFFSET = -0.15; // Slightly below chandelier center
const NUM_LAMPS = 6;

function generateLampPositions(): [number, number, number][] {
  const positions: [number, number, number][] = [];
  for (let i = 0; i < NUM_LAMPS; i++) {
    const angle = (i * Math.PI * 2) / NUM_LAMPS;
    positions.push([
      Math.cos(angle) * LAMP_RADIUS,
      LAMP_HEIGHT_OFFSET,
      Math.sin(angle) * LAMP_RADIUS,
    ]);
  }
  return positions;
}

export function Chandelier() {
  const { scene } = useGLTF(CHANDELIER_MODEL_PATH);

  // Clone the scene to avoid modifying the cached original
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    // Traverse and update materials to use proper color space
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat.map) {
            mat.map.colorSpace = THREE.SRGBColorSpace;
            mat.map.needsUpdate = true;
          }
        }
      }
    });
    return clone;
  }, [scene]);

  // Generate lamp positions once
  const lampPositions = useMemo(() => generateLampPositions(), []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Dispose cloned scene materials
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) {
            child.geometry.dispose();
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
    };
  }, [clonedScene]);

  // The model already has a scale of 0.01 in the GLTF
  // We need to scale it up to fit the room (room is 32x28, height 8m)
  // Current model is about 0.8m after internal scale, we want it around 1.5-2m
  const chandelierScale = 2.5;

  return (
    <group position={[0, 7.5, 0]} name="chandelier">
      {/* The chandelier model */}
      <primitive
        object={clonedScene}
        scale={[chandelierScale, chandelierScale, chandelierScale]}
      />

      {/* Point lights at each lamp position */}
      {lampPositions.map((position, index) => (
        <pointLight
          key={`chandelier-lamp-${index}`}
          position={position}
          color={LAMP_LIGHT_CONFIG.color}
          intensity={LAMP_LIGHT_CONFIG.intensity}
          distance={LAMP_LIGHT_CONFIG.distance}
          decay={LAMP_LIGHT_CONFIG.decay}
        />
      ))}

      {/* Central ambient glow from the chandelier */}
      <pointLight
        position={[0, -0.1, 0]}
        color={LAMP_LIGHT_CONFIG.color}
        intensity={2.2}
        distance={14}
        decay={2}
      />
    </group>
  );
}

// Preload the model for faster initial render
useGLTF.preload(CHANDELIER_MODEL_PATH);

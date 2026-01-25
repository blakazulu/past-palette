import { useMemo, useEffect } from 'react';
import * as THREE from 'three';

// Urn positions: alcove entrances + door flanking
const PALM_URN_POSITIONS: [number, number, number][] = [
  [-13, 0, -4],
  [-13, 0, 6],
  [13, 0, -4],
  [13, 0, 6],
  [-2, 0, 13],
  [2, 0, 13],
];

// Central column positions for vines
const COLUMN_VINE_POSITIONS: [number, number, number][] = [
  [-4, 0, -2],
  [4, 0, -2],
];

interface PalmUrnsProps {
  positions?: [number, number, number][];
}

function PalmUrns({ positions = PALM_URN_POSITIONS }: PalmUrnsProps) {
  // Create materials with useMemo for performance
  const urnMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#C4725F',
        roughness: 0.8,
      }),
    []
  );

  const frondMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#2D5A27',
        side: THREE.DoubleSide,
        roughness: 0.6,
      }),
    []
  );

  // Dispose materials on unmount
  useEffect(() => {
    return () => {
      urnMaterial.dispose();
      frondMaterial.dispose();
    };
  }, [urnMaterial, frondMaterial]);

  // Generate frond angles (6 fronds arranged radially)
  const frondAngles = useMemo(() => {
    const angles: number[] = [];
    for (let i = 0; i < 6; i++) {
      angles.push((i * Math.PI * 2) / 6);
    }
    return angles;
  }, []);

  return (
    <group>
      {positions.map((position, index) => (
        <group key={`palm-urn-${index}`} position={position}>
          {/* Terracotta urn - tapered cylinder */}
          <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.25, 0.6, 16]} />
            <primitive object={urnMaterial} attach="material" />
          </mesh>

          {/* Urn rim */}
          <mesh position={[0, 0.62, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.2, 0.05, 16]} />
            <primitive object={urnMaterial} attach="material" />
          </mesh>

          {/* Palm fronds - 6 planes arranged radially */}
          {frondAngles.map((angle, frondIndex) => (
            <mesh
              key={`frond-${frondIndex}`}
              position={[
                Math.sin(angle) * 0.1,
                0.9,
                Math.cos(angle) * 0.1,
              ]}
              rotation={[
                -Math.PI / 6, // Tilt outward
                angle,
                0,
              ]}
              castShadow
            >
              <planeGeometry args={[0.15, 0.6]} />
              <primitive object={frondMaterial} attach="material" />
            </mesh>
          ))}

          {/* Central stem */}
          <mesh position={[0, 0.75, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.03, 0.3, 8]} />
            <primitive object={frondMaterial} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

interface ColumnVinesProps {
  positions?: [number, number, number][];
  columnHeight?: number;
}

function ColumnVines({
  positions = COLUMN_VINE_POSITIONS,
  columnHeight = 4,
}: ColumnVinesProps) {
  const vineMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3D6B35',
        roughness: 0.7,
      }),
    []
  );

  // Dispose material on unmount
  useEffect(() => {
    return () => {
      vineMaterial.dispose();
    };
  }, [vineMaterial]);

  // Generate spiral vine segments
  const vineSegments = useMemo(() => {
    const segments: { position: [number, number, number]; rotation: number }[] = [];
    const spiralTurns = 3;
    const segmentsPerTurn = 12;
    const totalSegments = spiralTurns * segmentsPerTurn;
    const columnRadius = 0.35; // Approximate column radius

    for (let i = 0; i < totalSegments; i++) {
      const t = i / totalSegments;
      const angle = t * spiralTurns * Math.PI * 2;
      const y = t * columnHeight;
      const x = Math.cos(angle) * columnRadius;
      const z = Math.sin(angle) * columnRadius;

      segments.push({
        position: [x, y, z],
        rotation: angle,
      });
    }

    return segments;
  }, [columnHeight]);

  return (
    <group>
      {positions.map((position, colIndex) => (
        <group key={`column-vine-${colIndex}`} position={position}>
          {vineSegments.map((segment, segIndex) => (
            <mesh
              key={`vine-segment-${segIndex}`}
              position={segment.position}
              rotation={[0, segment.rotation, Math.PI / 6]}
              castShadow
            >
              <boxGeometry args={[0.08, 0.12, 0.04]} />
              <primitive object={vineMaterial} attach="material" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export function GalleryPlants() {
  return (
    <group>
      <PalmUrns />
      <ColumnVines />
    </group>
  );
}

export { PalmUrns, ColumnVines };

import { useEffect, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Ivy texture paths
const IVY_DIFF_URL = '/textures/ivy_leaves_diff.png';
const IVY_OPACITY_URL = '/textures/ivy_leaves_opacity.png';
const IVY_NORMAL_URL = '/textures/ivy_leaves_normal.png';
const IVY_ROUGHNESS_URL = '/textures/ivy_leaves_roughness.png';

// All 6 column positions from GalleryColumns.tsx
const ALL_COLUMN_POSITIONS: [number, number, number][] = [
  // 4 corner columns
  [-12, 0, -10],
  [12, 0, -10],
  [-12, 0, 8],
  [12, 0, 8],
  // 2 central flanking columns
  [-4, 0, -2],
  [4, 0, -2],
];

// Column dimensions
const COLUMN_RADIUS = 0.5;
const VINE_MAX_HEIGHT = 4; // Partial coverage, capitals visible

// Seeded random number generator for consistent results
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

interface VineStrandData {
  segments: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  }[];
  leaves: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
  }[];
}

interface ColumnVineData {
  strands: VineStrandData[];
  startRotation: number;
}

// Generate vine data for a single column
function generateColumnVineData(columnIndex: number): ColumnVineData {
  const random = seededRandom(columnIndex * 1000 + 42);

  // 2-3 vine strands per column
  const numStrands = 2 + Math.floor(random() * 2);
  const startRotation = random() * Math.PI * 2;

  const strands: VineStrandData[] = [];

  for (let strandIndex = 0; strandIndex < numStrands; strandIndex++) {
    const strandRandom = seededRandom(columnIndex * 100 + strandIndex * 10 + 123);

    // Each strand spirals 3-4 times around the column
    const spiralTurns = 3 + strandRandom();
    const strandStartAngle = startRotation + (strandIndex * Math.PI * 2) / numStrands + strandRandom() * 0.3;

    // Vary vine height slightly per strand
    const strandHeight = VINE_MAX_HEIGHT * (0.8 + strandRandom() * 0.2);

    const segments: VineStrandData['segments'] = [];
    const leaves: VineStrandData['leaves'] = [];

    // Generate stem segments
    const segmentsPerTurn = 16;
    const totalSegments = Math.floor(spiralTurns * segmentsPerTurn);

    for (let i = 0; i < totalSegments; i++) {
      const t = i / totalSegments;
      const angle = strandStartAngle + t * spiralTurns * Math.PI * 2;
      const y = t * strandHeight + 0.3; // Start slightly above ground

      // Slight radius variation for organic feel
      const radiusVariation = COLUMN_RADIUS + 0.08 + strandRandom() * 0.03;
      const x = Math.cos(angle) * radiusVariation;
      const z = Math.sin(angle) * radiusVariation;

      // Segment orientation follows the spiral
      const nextT = (i + 1) / totalSegments;
      const nextAngle = strandStartAngle + nextT * spiralTurns * Math.PI * 2;
      const tangentAngle = Math.atan2(
        Math.sin(nextAngle) - Math.sin(angle),
        Math.cos(nextAngle) - Math.cos(angle)
      );

      segments.push({
        position: [x, y, z],
        rotation: [0, -angle + Math.PI / 2, Math.PI / 12], // Slight upward tilt
        scale: [0.04 + strandRandom() * 0.01, 0.08, 0.04],
      });
    }

    // Generate leaves along the vine
    // Target ~40-50 leaves per strand (100-150 total per column with 2-3 strands)
    const leavesPerStrand = 40 + Math.floor(strandRandom() * 15);

    for (let i = 0; i < leavesPerStrand; i++) {
      const leafRandom = seededRandom(columnIndex * 1000 + strandIndex * 100 + i);

      const t = leafRandom(); // Random position along vine
      const angle = strandStartAngle + t * spiralTurns * Math.PI * 2;
      const y = t * strandHeight + 0.3;

      // Leaves positioned slightly outward from stem
      const leafOutwardOffset = 0.08 + leafRandom() * 0.06;
      const radiusWithOffset = COLUMN_RADIUS + 0.1 + leafOutwardOffset;

      // Add some randomness to position
      const angleOffset = (leafRandom() - 0.5) * 0.4;
      const finalAngle = angle + angleOffset;

      const x = Math.cos(finalAngle) * radiusWithOffset;
      const z = Math.sin(finalAngle) * radiusWithOffset;
      const yOffset = (leafRandom() - 0.5) * 0.1;

      // Vary leaf rotation for natural look
      const leafRotX = -Math.PI / 4 + (leafRandom() - 0.5) * Math.PI / 3; // Tilt
      const leafRotY = finalAngle + Math.PI + (leafRandom() - 0.5) * 0.5; // Face outward
      const leafRotZ = (leafRandom() - 0.5) * Math.PI / 4; // Twist

      // Vary leaf scale
      const leafScale = 0.12 + leafRandom() * 0.08;

      leaves.push({
        position: [x, y + yOffset, z],
        rotation: [leafRotX, leafRotY, leafRotZ],
        scale: leafScale,
      });
    }

    strands.push({ segments, leaves });
  }

  return { strands, startRotation };
}

interface ColumnVinesProps {
  positions?: [number, number, number][];
}

export function ColumnVines({ positions = ALL_COLUMN_POSITIONS }: ColumnVinesProps) {
  // Load ivy textures
  const [diffuseMap, opacityMap, normalMap, roughnessMap] = useTexture([
    IVY_DIFF_URL,
    IVY_OPACITY_URL,
    IVY_NORMAL_URL,
    IVY_ROUGHNESS_URL,
  ]);

  // Configure textures
  useEffect(() => {
    diffuseMap.colorSpace = THREE.SRGBColorSpace;
    diffuseMap.needsUpdate = true;
  }, [diffuseMap]);

  // Shared leaf geometry (plane for alpha-mapped leaves)
  const leafGeometry = useMemo(() => {
    return new THREE.PlaneGeometry(1, 1);
  }, []);

  // Shared stem geometry
  const stemGeometry = useMemo(() => {
    return new THREE.BoxGeometry(1, 1, 1);
  }, []);

  // Leaf material with alpha testing
  const leafMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: diffuseMap,
      alphaMap: opacityMap,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      roughness: 0.7,
      metalness: 0.0,
    });
  }, [diffuseMap, opacityMap, normalMap, roughnessMap]);

  // Stem material (green-brown color)
  const stemMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#4A5D23', // Dark olive green
      roughness: 0.85,
      metalness: 0.0,
    });
  }, []);

  // Pre-generate vine data for all columns
  const columnVineData = useMemo(() => {
    return positions.map((_, index) => generateColumnVineData(index));
  }, [positions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leafGeometry.dispose();
      stemGeometry.dispose();
      leafMaterial.dispose();
      stemMaterial.dispose();
    };
  }, [leafGeometry, stemGeometry, leafMaterial, stemMaterial]);

  return (
    <group name="column-vines">
      {positions.map((position, colIndex) => {
        const vineData = columnVineData[colIndex];

        return (
          <group key={`column-vine-${colIndex}`} position={position}>
            {vineData.strands.map((strand, strandIndex) => (
              <group key={`strand-${strandIndex}`}>
                {/* Stem segments */}
                {strand.segments.map((segment, segIndex) => (
                  <mesh
                    key={`stem-${segIndex}`}
                    geometry={stemGeometry}
                    material={stemMaterial}
                    position={segment.position}
                    rotation={segment.rotation}
                    scale={segment.scale}
                    castShadow
                  />
                ))}

                {/* Ivy leaves */}
                {strand.leaves.map((leaf, leafIndex) => (
                  <mesh
                    key={`leaf-${leafIndex}`}
                    geometry={leafGeometry}
                    material={leafMaterial}
                    position={leaf.position}
                    rotation={leaf.rotation}
                    scale={[leaf.scale, leaf.scale, leaf.scale]}
                    castShadow
                  />
                ))}
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
}

export default ColumnVines;

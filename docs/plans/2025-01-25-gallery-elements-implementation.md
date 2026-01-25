# Gallery Elements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 6 toggleable decorative elements (columns, central pedestal, alcoves, floor mosaic, plants, statues) to the gallery with archaeological site aesthetics.

**Architecture:** Each element is a separate React Three Fiber component. Settings are stored in Zustand with localStorage persistence. Users toggle elements via a collapsible section in the entrance modal.

**Tech Stack:** React Three Fiber, Three.js, Zustand (persisted)

---

### Task 1: Add Gallery Elements Settings to Store

**Files:**
- Modify: `src/stores/appStore.ts`

**Step 1: Add GalleryElements interface and state**

Add after line 54 (after `setHapticsEnabled`):

```typescript
  galleryElements: {
    columns: boolean;
    centralDisplay: boolean;
    alcoves: boolean;
    floorMosaic: boolean;
    plants: boolean;
    statues: boolean;
  };
  setGalleryElement: (key: keyof SettingsState['galleryElements'], value: boolean) => void;
```

**Step 2: Add default values and action in the persist store**

In the `persist` callback (around line 60), add after `setHapticsEnabled`:

```typescript
      galleryElements: {
        columns: true,
        centralDisplay: true,
        alcoves: true,
        floorMosaic: true,
        plants: true,
        statues: true,
      },

      setGalleryElement: (key, value) =>
        set((state) => ({
          galleryElements: { ...state.galleryElements, [key]: value },
        })),
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/stores/appStore.ts
git commit -m "feat(settings): add gallery elements toggle settings"
```

---

### Task 2: Create GalleryColumns Component

**Files:**
- Create: `src/components/gallery-tour/elements/GalleryColumns.tsx`

**Step 1: Create the columns component**

```typescript
// src/components/gallery-tour/elements/GalleryColumns.tsx

import { useMemo, useEffect } from 'react';
import * as THREE from 'three';

const COLUMN_POSITIONS: [number, number, number][] = [
  // Corner columns
  [-12, 0, -10],
  [12, 0, -10],
  [-12, 0, 8],
  [12, 0, 8],
  // Central flanking columns
  [-4, 0, -2],
  [4, 0, -2],
];

const COLUMN_RADIUS = 0.5;
const COLUMN_HEIGHT = 6;
const CAPITAL_HEIGHT = 0.3;

function Column({ position }: { position: [number, number, number] }) {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#D4A574',
        roughness: 0.9,
        metalness: 0.1,
      }),
    []
  );

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return (
    <group position={position}>
      {/* Column shaft */}
      <mesh position={[0, COLUMN_HEIGHT / 2, 0]} castShadow>
        <cylinderGeometry args={[COLUMN_RADIUS, COLUMN_RADIUS * 1.1, COLUMN_HEIGHT, 16]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Simple Doric capital */}
      <mesh position={[0, COLUMN_HEIGHT + CAPITAL_HEIGHT / 2, 0]} castShadow>
        <cylinderGeometry args={[COLUMN_RADIUS * 1.3, COLUMN_RADIUS, CAPITAL_HEIGHT, 16]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[COLUMN_RADIUS * 1.2, COLUMN_RADIUS * 1.3, 0.3, 16]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

export function GalleryColumns() {
  return (
    <group>
      {COLUMN_POSITIONS.map((pos, i) => (
        <Column key={i} position={pos} />
      ))}
    </group>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/gallery-tour/elements/GalleryColumns.tsx
git commit -m "feat(gallery): add decorative columns component"
```

---

### Task 3: Create CentralPedestal Component

**Files:**
- Create: `src/components/gallery-tour/elements/CentralPedestal.tsx`

**Step 1: Create the pedestal component with rotating vase**

```typescript
// src/components/gallery-tour/elements/CentralPedestal.tsx

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PEDESTAL_POSITION: [number, number, number] = [0, 0, -2];

export function CentralPedestal() {
  const vaseRef = useRef<THREE.Group>(null);

  const stoneMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#A89080',
        roughness: 0.85,
        metalness: 0.1,
      }),
    []
  );

  const terracottaMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#C4725F',
        roughness: 0.7,
        metalness: 0.05,
      }),
    []
  );

  useEffect(() => {
    return () => {
      stoneMaterial.dispose();
      terracottaMaterial.dispose();
    };
  }, [stoneMaterial, terracottaMaterial]);

  // Slowly rotate the vase
  useFrame((_, delta) => {
    if (vaseRef.current) {
      vaseRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group position={PEDESTAL_POSITION}>
      {/* Bottom step */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[1.5, 0.3, 1.5]} />
        <primitive object={stoneMaterial} attach="material" />
      </mesh>
      {/* Middle step */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.2, 0.3, 1.2]} />
        <primitive object={stoneMaterial} attach="material" />
      </mesh>
      {/* Top step */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <boxGeometry args={[0.9, 0.3, 0.9]} />
        <primitive object={stoneMaterial} attach="material" />
      </mesh>

      {/* Decorative amphora/vase */}
      <group ref={vaseRef} position={[0, 1.2, 0]}>
        {/* Vase body */}
        <mesh castShadow>
          <latheGeometry
            args={[
              [
                new THREE.Vector2(0, 0),
                new THREE.Vector2(0.15, 0.05),
                new THREE.Vector2(0.25, 0.3),
                new THREE.Vector2(0.3, 0.5),
                new THREE.Vector2(0.25, 0.7),
                new THREE.Vector2(0.15, 0.85),
                new THREE.Vector2(0.12, 0.9),
                new THREE.Vector2(0.15, 0.95),
                new THREE.Vector2(0.1, 1.0),
              ],
              24,
            ]}
          />
          <primitive object={terracottaMaterial} attach="material" />
        </mesh>
      </group>
    </group>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/gallery-tour/elements/CentralPedestal.tsx
git commit -m "feat(gallery): add central pedestal with rotating vase"
```

---

### Task 4: Create WallAlcoves Component

**Files:**
- Create: `src/components/gallery-tour/elements/WallAlcoves.tsx`

**Step 1: Create the alcoves component**

```typescript
// src/components/gallery-tour/elements/WallAlcoves.tsx

import { useMemo, useEffect } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const WALL_TEXTURE_URL = '/textures/white_plaster_02_diff_1k.jpg';

// Alcove positions: [x, z, rotationY]
// West wall alcoves (x = -16, facing east)
// East wall alcoves (x = 16, facing west)
const ALCOVE_CONFIGS: { position: [number, number, number]; rotation: number }[] = [
  // West wall
  { position: [-14, 0, -6], rotation: 0 },
  { position: [-14, 0, 4], rotation: 0 },
  // East wall
  { position: [14, 0, -6], rotation: Math.PI },
  { position: [14, 0, 4], rotation: Math.PI },
];

const ALCOVE_WIDTH = 4;
const ALCOVE_DEPTH = 2;
const ALCOVE_HEIGHT = 4;
const WALL_THICKNESS = 0.2;

function Alcove({
  position,
  rotation,
  material,
}: {
  position: [number, number, number];
  rotation: number;
  material: THREE.Material;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Left wall of alcove */}
      <mesh position={[-ALCOVE_WIDTH / 2, ALCOVE_HEIGHT / 2, -ALCOVE_DEPTH / 2]} castShadow>
        <boxGeometry args={[WALL_THICKNESS, ALCOVE_HEIGHT, ALCOVE_DEPTH]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Right wall of alcove */}
      <mesh position={[ALCOVE_WIDTH / 2, ALCOVE_HEIGHT / 2, -ALCOVE_DEPTH / 2]} castShadow>
        <boxGeometry args={[WALL_THICKNESS, ALCOVE_HEIGHT, ALCOVE_DEPTH]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Back wall of alcove */}
      <mesh position={[0, ALCOVE_HEIGHT / 2, -ALCOVE_DEPTH + WALL_THICKNESS / 2]} castShadow>
        <boxGeometry args={[ALCOVE_WIDTH, ALCOVE_HEIGHT, WALL_THICKNESS]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

export function WallAlcoves() {
  const wallTexture = useTexture(WALL_TEXTURE_URL);

  useEffect(() => {
    wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(2, 2);
    wallTexture.colorSpace = THREE.SRGBColorSpace;
    wallTexture.needsUpdate = true;
  }, [wallTexture]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: wallTexture,
        roughness: 0.9,
      }),
    [wallTexture]
  );

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return (
    <group>
      {ALCOVE_CONFIGS.map((config, i) => (
        <Alcove key={i} position={config.position} rotation={config.rotation} material={material} />
      ))}
    </group>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/gallery-tour/elements/WallAlcoves.tsx
git commit -m "feat(gallery): add wall alcoves for intimate viewing spaces"
```

---

### Task 5: Create FloorMosaic Component

**Files:**
- Create: `src/components/gallery-tour/elements/FloorMosaic.tsx`

**Step 1: Create the floor mosaic component**

```typescript
// src/components/gallery-tour/elements/FloorMosaic.tsx

import { useMemo, useEffect } from 'react';
import * as THREE from 'three';

const MOSAIC_POSITION: [number, number, number] = [0, 0.01, -2];
const MOSAIC_RADIUS = 3;

export function FloorMosaic() {
  // Create a procedural mosaic texture
  const texture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Background - cream/tan stone color
    ctx.fillStyle = '#E8DCC8';
    ctx.fillRect(0, 0, size, size);

    const center = size / 2;

    // Outer border ring - terracotta
    ctx.strokeStyle = '#B5651D';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(center, center, size / 2 - 30, 0, Math.PI * 2);
    ctx.stroke();

    // Greek key pattern (simplified as concentric rings)
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 8;
    for (let r = 60; r < size / 2 - 50; r += 40) {
      ctx.beginPath();
      ctx.arc(center, center, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Center rosette
    ctx.fillStyle = '#C4725F';
    ctx.beginPath();
    ctx.arc(center, center, 40, 0, Math.PI * 2);
    ctx.fill();

    // Rosette petals
    ctx.fillStyle = '#D4A574';
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x = center + Math.cos(angle) * 70;
      const y = center + Math.sin(angle) * 70;
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
      }),
    [texture]
  );

  useEffect(() => {
    return () => {
      texture.dispose();
      material.dispose();
    };
  }, [texture, material]);

  return (
    <mesh position={MOSAIC_POSITION} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[MOSAIC_RADIUS, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/gallery-tour/elements/FloorMosaic.tsx
git commit -m "feat(gallery): add decorative floor mosaic"
```

---

### Task 6: Create GalleryPlants Component

**Files:**
- Create: `src/components/gallery-tour/elements/GalleryPlants.tsx`

**Step 1: Create the plants component**

```typescript
// src/components/gallery-tour/elements/GalleryPlants.tsx

import { useMemo, useEffect } from 'react';
import * as THREE from 'three';

// Urn positions: alcove entrances + door flanking
const URN_POSITIONS: [number, number, number][] = [
  // West alcove entrances
  [-13, 0, -4],
  [-13, 0, 6],
  // East alcove entrances
  [13, 0, -4],
  [13, 0, 6],
  // Flanking entrance door
  [-2, 0, 13],
  [2, 0, 13],
];

// Columns with vines (central flanking columns)
const VINE_COLUMN_POSITIONS: [number, number, number][] = [
  [-4, 0, -2],
  [4, 0, -2],
];

function PalmUrn({ position }: { position: [number, number, number] }) {
  const terracottaMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#C4725F',
        roughness: 0.8,
      }),
    []
  );

  const leafMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#2D5A27',
        roughness: 0.6,
        side: THREE.DoubleSide,
      }),
    []
  );

  useEffect(() => {
    return () => {
      terracottaMaterial.dispose();
      leafMaterial.dispose();
    };
  }, [terracottaMaterial, leafMaterial]);

  return (
    <group position={position}>
      {/* Terracotta urn */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 0.6, 16]} />
        <primitive object={terracottaMaterial} attach="material" />
      </mesh>
      {/* Urn rim */}
      <mesh position={[0, 0.62, 0]} castShadow>
        <torusGeometry args={[0.22, 0.04, 8, 16]} />
        <primitive object={terracottaMaterial} attach="material" />
      </mesh>

      {/* Palm fronds - simple planes arranged radially */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 6;
        const tilt = 0.4 + Math.random() * 0.2;
        return (
          <mesh
            key={i}
            position={[0, 1.2, 0]}
            rotation={[tilt, angle, 0]}
          >
            <planeGeometry args={[0.3, 1.5]} />
            <primitive object={leafMaterial} attach="material" />
          </mesh>
        );
      })}
    </group>
  );
}

function ColumnVine({ position }: { position: [number, number, number] }) {
  const vineMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3D6B35',
        roughness: 0.7,
      }),
    []
  );

  useEffect(() => {
    return () => {
      vineMaterial.dispose();
    };
  }, [vineMaterial]);

  // Create a spiral of small segments
  const segments = useMemo(() => {
    const result: { pos: [number, number, number]; rot: [number, number, number] }[] = [];
    for (let i = 0; i < 12; i++) {
      const height = 0.3 + i * 0.25;
      const angle = i * 0.5;
      const radius = 0.55;
      result.push({
        pos: [Math.cos(angle) * radius, height, Math.sin(angle) * radius],
        rot: [0, -angle, Math.PI / 4],
      });
    }
    return result;
  }, []);

  return (
    <group position={position}>
      {segments.map((seg, i) => (
        <mesh key={i} position={seg.pos} rotation={seg.rot}>
          <boxGeometry args={[0.08, 0.3, 0.02]} />
          <primitive object={vineMaterial} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

export function GalleryPlants() {
  return (
    <group>
      {URN_POSITIONS.map((pos, i) => (
        <PalmUrn key={`urn-${i}`} position={pos} />
      ))}
      {VINE_COLUMN_POSITIONS.map((pos, i) => (
        <ColumnVine key={`vine-${i}`} position={pos} />
      ))}
    </group>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/gallery-tour/elements/GalleryPlants.tsx
git commit -m "feat(gallery): add decorative plants with urns and vines"
```

---

### Task 7: Create GalleryStatues Component

**Files:**
- Create: `src/components/gallery-tour/elements/GalleryStatues.tsx`

**Step 1: Create the statues component**

```typescript
// src/components/gallery-tour/elements/GalleryStatues.tsx

import { useMemo, useEffect } from 'react';
import * as THREE from 'three';

const SANDSTONE_COLOR = '#C9B896';

// Sphinx positions (flanking central pedestal)
const SPHINX_POSITIONS: { pos: [number, number, number]; rot: number }[] = [
  { pos: [-5, 0, -2], rot: Math.PI / 6 },
  { pos: [5, 0, -2], rot: -Math.PI / 6 },
];

// Other statues in alcoves
const ALCOVE_STATUES: { pos: [number, number, number]; type: 'anubis' | 'lion' }[] = [
  { pos: [-13.5, 0, -6], type: 'anubis' },
  { pos: [13.5, 0, 4], type: 'lion' },
];

function Sphinx({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SANDSTONE_COLOR,
        roughness: 0.85,
        metalness: 0.05,
      }),
    []
  );

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[1.2, 0.2, 0.6]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Body (lying lion shape) */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1, 0.4, 0.5]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Front legs */}
      <mesh position={[0.35, 0.25, 0]} castShadow>
        <boxGeometry args={[0.25, 0.3, 0.4]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Head (human-ish) */}
      <mesh position={[0.5, 0.75, 0]} castShadow>
        <boxGeometry args={[0.25, 0.35, 0.3]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Headdress */}
      <mesh position={[0.5, 0.95, 0]} castShadow>
        <boxGeometry args={[0.3, 0.15, 0.35]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

function Anubis({ position }: { position: [number, number, number] }) {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#2A2A2A',
        roughness: 0.7,
        metalness: 0.1,
      }),
    []
  );

  const baseMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SANDSTONE_COLOR,
        roughness: 0.85,
      }),
    []
  );

  useEffect(() => {
    return () => {
      material.dispose();
      baseMaterial.dispose();
    };
  }, [material, baseMaterial]);

  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[0.5, 0.2, 0.5]} />
        <primitive object={baseMaterial} attach="material" />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <boxGeometry args={[0.3, 0.9, 0.25]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Jackal head */}
      <mesh position={[0, 1.2, 0.1]} rotation={[-0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.2, 0.25, 0.35]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Ears */}
      <mesh position={[-0.08, 1.4, 0]} castShadow>
        <boxGeometry args={[0.06, 0.15, 0.06]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[0.08, 1.4, 0]} castShadow>
        <boxGeometry args={[0.06, 0.15, 0.06]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

function Lion({ position }: { position: [number, number, number] }) {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SANDSTONE_COLOR,
        roughness: 0.85,
        metalness: 0.05,
      }),
    []
  );

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return (
    <group position={position} rotation={[0, Math.PI, 0]}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[0.8, 0.2, 0.5]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.7, 0.5, 0.4]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Mane/Head */}
      <mesh position={[0.3, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.25, 12, 12]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Front legs */}
      <mesh position={[0.25, 0.25, 0.12]} castShadow>
        <boxGeometry args={[0.12, 0.3, 0.1]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[0.25, 0.25, -0.12]} castShadow>
        <boxGeometry args={[0.12, 0.3, 0.1]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

export function GalleryStatues() {
  return (
    <group>
      {SPHINX_POSITIONS.map((config, i) => (
        <Sphinx key={`sphinx-${i}`} position={config.pos} rotation={config.rot} />
      ))}
      {ALCOVE_STATUES.map((config, i) =>
        config.type === 'anubis' ? (
          <Anubis key={`statue-${i}`} position={config.pos} />
        ) : (
          <Lion key={`statue-${i}`} position={config.pos} />
        )
      )}
    </group>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/gallery-tour/elements/GalleryStatues.tsx
git commit -m "feat(gallery): add decorative statues (sphinxes, anubis, lion)"
```

---

### Task 8: Create Elements Index File

**Files:**
- Create: `src/components/gallery-tour/elements/index.ts`

**Step 1: Create the barrel export file**

```typescript
// src/components/gallery-tour/elements/index.ts

export { GalleryColumns } from './GalleryColumns';
export { CentralPedestal } from './CentralPedestal';
export { WallAlcoves } from './WallAlcoves';
export { FloorMosaic } from './FloorMosaic';
export { GalleryPlants } from './GalleryPlants';
export { GalleryStatues } from './GalleryStatues';
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/gallery-tour/elements/index.ts
git commit -m "feat(gallery): add elements barrel export"
```

---

### Task 9: Add Customize Gallery UI to Entrance Modal

**Files:**
- Modify: `src/pages/GalleryTourPage.tsx`

**Step 1: Add imports and state**

Add to imports at top:
```typescript
import { useSettingsStore } from '@/stores/appStore';
```

Add inside `GalleryTourPage` function, after `const [showInstructions, setShowInstructions]`:
```typescript
  const [showCustomize, setShowCustomize] = useState(false);
  const { galleryElements, setGalleryElement } = useSettingsStore();
```

**Step 2: Add helper function for formatting labels**

Add after the `shuffleArray` function:
```typescript
/**
 * Format camelCase keys to readable labels
 */
function formatElementLabel(key: string): string {
  const labels: Record<string, string> = {
    columns: 'Columns',
    centralDisplay: 'Central Display',
    alcoves: 'Wall Alcoves',
    floorMosaic: 'Floor Mosaic',
    plants: 'Plants',
    statues: 'Statues',
  };
  return labels[key] || key;
}
```

**Step 3: Update the instructions overlay JSX**

Find the instructions overlay section (around line 232) and replace the entire content inside the modal div (after the h2 and instructions div, before the Enter button):

```typescript
            {/* Customize Gallery Section */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowCustomize(!showCustomize)}
                className="text-obsidian-400 hover:text-obsidian-200 text-sm flex items-center gap-1 mx-auto"
              >
                <span>{showCustomize ? '▲' : '▼'}</span>
                <span>{t('galleryTour.customize', 'Customize Gallery')}</span>
              </button>

              {showCustomize && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-left">
                  {(Object.keys(galleryElements) as Array<keyof typeof galleryElements>).map((key) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 text-obsidian-300 text-sm cursor-pointer hover:text-obsidian-100"
                    >
                      <input
                        type="checkbox"
                        checked={galleryElements[key]}
                        onChange={(e) => setGalleryElement(key, e.target.checked)}
                        className="w-4 h-4 rounded border-obsidian-600 bg-obsidian-800 text-gold-500 focus:ring-gold-500"
                      />
                      {formatElementLabel(key)}
                    </label>
                  ))}
                </div>
              )}
            </div>
```

**Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add src/pages/GalleryTourPage.tsx
git commit -m "feat(gallery): add customize gallery UI to entrance modal"
```

---

### Task 10: Integrate Gallery Elements into Canvas

**Files:**
- Modify: `src/pages/GalleryTourPage.tsx`

**Step 1: Add element imports**

Add to the imports from `@/components/gallery-tour`:
```typescript
import {
  GalleryRoom,
  ArtworkFrame,
  FirstPersonControls,
  TouchControls,
  ArtworkInfoOverlay,
} from '@/components/gallery-tour';
import {
  GalleryColumns,
  CentralPedestal,
  WallAlcoves,
  FloorMosaic,
  GalleryPlants,
  GalleryStatues,
} from '@/components/gallery-tour/elements';
```

**Step 2: Add conditional element rendering inside Canvas/Suspense**

After the `<GalleryRoom />` component and before the FRAME_POSITIONS map, add:
```typescript
          {/* Gallery decorative elements */}
          {galleryElements.columns && <GalleryColumns />}
          {galleryElements.centralDisplay && <CentralPedestal />}
          {galleryElements.alcoves && <WallAlcoves />}
          {galleryElements.floorMosaic && <FloorMosaic />}
          {galleryElements.plants && <GalleryPlants />}
          {galleryElements.statues && <GalleryStatues />}
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/pages/GalleryTourPage.tsx
git commit -m "feat(gallery): integrate toggleable elements into 3D canvas"
```

---

### Task 11: Add Translation Keys

**Files:**
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/he.json`

**Step 1: Add English translation**

Add to the `galleryTour` section:
```json
"customize": "Customize Gallery"
```

**Step 2: Add Hebrew translation**

Add to the `galleryTour` section:
```json
"customize": "התאמת הגלריה"
```

**Step 3: Commit**

```bash
git add src/i18n/locales/en.json src/i18n/locales/he.json
git commit -m "feat(i18n): add gallery customize translation"
```

---

### Task 12: Manual Testing

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Test checklist**

- [ ] Navigate to gallery tour page
- [ ] Verify instructions modal shows "Customize Gallery" button
- [ ] Click to expand - verify 6 checkboxes appear
- [ ] Uncheck "Columns" and enter gallery - verify no columns
- [ ] Reload page - verify setting persisted (columns still off)
- [ ] Re-enable columns and verify they appear
- [ ] Test each element toggle individually
- [ ] Verify no console errors
- [ ] Test on mobile viewport

**Step 3: Final verification**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 4: Commit any fixes if needed**

---

## Summary

This plan creates 6 decorative 3D elements for the gallery:
1. **GalleryColumns** - 6 Doric-style sandstone columns
2. **CentralPedestal** - Stepped stone pedestal with rotating terracotta vase
3. **WallAlcoves** - 4 partial walls creating intimate viewing spaces
4. **FloorMosaic** - Procedural Greek-style circular mosaic
5. **GalleryPlants** - Terracotta urns with palms + column vines
6. **GalleryStatues** - Sphinxes, Anubis figure, and lion

All elements are toggleable via persisted settings accessible from the entrance modal.

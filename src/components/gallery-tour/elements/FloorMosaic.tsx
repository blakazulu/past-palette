import { useMemo, useEffect } from 'react';
import * as THREE from 'three';

const MOSAIC_RADIUS = 3; // 6m diameter circle
const MOSAIC_SEGMENTS = 64;

// Mosaic colors
const BACKGROUND_COLOR = '#E8DCC8'; // Cream/tan
const OUTER_RING_COLOR = '#B5651D'; // Terracotta
const CONCENTRIC_RING_COLOR = '#8B4513'; // Brown
const ROSETTE_CENTER_COLOR = '#C4725F';
const ROSETTE_PETAL_COLOR = '#D4A574';

/**
 * Creates a procedural mosaic texture using canvas
 */
function createMosaicTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size / 2;

  // Background - cream/tan
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.beginPath();
  ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
  ctx.fill();

  // Terracotta outer ring
  ctx.strokeStyle = OUTER_RING_COLOR;
  ctx.lineWidth = maxRadius * 0.08;
  ctx.beginPath();
  ctx.arc(centerX, centerY, maxRadius * 0.92, 0, Math.PI * 2);
  ctx.stroke();

  // Concentric rings in brown
  ctx.strokeStyle = CONCENTRIC_RING_COLOR;
  ctx.lineWidth = maxRadius * 0.02;

  const ringRadii = [0.75, 0.6, 0.45, 0.3];
  for (const radiusRatio of ringRadii) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius * radiusRatio, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Center rosette
  const rosetteRadius = maxRadius * 0.2;

  // Draw petals
  const petalCount = 8;
  ctx.fillStyle = ROSETTE_PETAL_COLOR;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    const petalLength = rosetteRadius * 1.5;
    const petalWidth = rosetteRadius * 0.5;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    // Petal shape using bezier curves
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      petalWidth * 0.5, petalLength * 0.3,
      petalWidth * 0.5, petalLength * 0.7,
      0, petalLength
    );
    ctx.bezierCurveTo(
      -petalWidth * 0.5, petalLength * 0.7,
      -petalWidth * 0.5, petalLength * 0.3,
      0, 0
    );
    ctx.fill();

    ctx.restore();
  }

  // Center circle of rosette
  ctx.fillStyle = ROSETTE_CENTER_COLOR;
  ctx.beginPath();
  ctx.arc(centerX, centerY, rosetteRadius * 0.6, 0, Math.PI * 2);
  ctx.fill();

  // Small decorative dots around outer ring
  ctx.fillStyle = CONCENTRIC_RING_COLOR;
  const dotCount = 24;
  const dotRadius = maxRadius * 0.015;
  const dotRingRadius = maxRadius * 0.82;

  for (let i = 0; i < dotCount; i++) {
    const angle = (i / dotCount) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * dotRingRadius;
    const y = centerY + Math.sin(angle) * dotRingRadius;

    ctx.beginPath();
    ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function FloorMosaic() {
  const { texture, material } = useMemo(() => {
    const tex = createMosaicTexture();
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
    });
    return { texture: tex, material: mat };
  }, []);

  // Dispose texture and material on unmount
  useEffect(() => {
    return () => {
      texture.dispose();
      material.dispose();
    };
  }, [texture, material]);

  return (
    <mesh
      position={[0, 0.01, -2]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <circleGeometry args={[MOSAIC_RADIUS, MOSAIC_SEGMENTS]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

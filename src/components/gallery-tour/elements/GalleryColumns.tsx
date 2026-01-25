import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

interface ColumnProps {
  position: [number, number, number];
  radius?: number;
  height?: number;
}

function DoricColumn({ position, radius = 0.5, height = 6 }: ColumnProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Column shaft geometry
  const shaftGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(radius, radius * 1.1, height, 16);
  }, [radius, height]);

  // Base geometry (wider cylinder)
  const baseGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(radius * 1.3, radius * 1.4, 0.3, 16);
  }, [radius]);

  // Capital geometry (echinus - curved part)
  const capitalEchinusGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(radius * 1.4, radius, 0.25, 16);
  }, [radius]);

  // Capital geometry (abacus - square slab on top)
  const capitalAbacusGeometry = useMemo(() => {
    return new THREE.BoxGeometry(radius * 3, 0.2, radius * 3);
  }, [radius]);

  // Shared material for weathered sandstone
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xD4A574,
      roughness: 0.9,
      metalness: 0.0,
    });
  }, []);

  // Cleanup geometries and material on unmount
  useEffect(() => {
    return () => {
      shaftGeometry.dispose();
      baseGeometry.dispose();
      capitalEchinusGeometry.dispose();
      capitalAbacusGeometry.dispose();
      material.dispose();
    };
  }, [shaftGeometry, baseGeometry, capitalEchinusGeometry, capitalAbacusGeometry, material]);

  const baseY = 0.15;
  const shaftY = height / 2 + 0.3;
  const echinusY = height + 0.3 + 0.125;
  const abacusY = height + 0.3 + 0.25 + 0.1;

  return (
    <group ref={groupRef} position={position}>
      {/* Base */}
      <mesh geometry={baseGeometry} material={material} position={[0, baseY, 0]} />

      {/* Shaft */}
      <mesh geometry={shaftGeometry} material={material} position={[0, shaftY, 0]} />

      {/* Capital - Echinus (curved part) */}
      <mesh geometry={capitalEchinusGeometry} material={material} position={[0, echinusY, 0]} />

      {/* Capital - Abacus (square slab) */}
      <mesh geometry={capitalAbacusGeometry} material={material} position={[0, abacusY, 0]} />
    </group>
  );
}

export function GalleryColumns() {
  // Column positions
  const columnPositions: [number, number, number][] = [
    // 4 corner columns
    [-12, 0, -10],
    [12, 0, -10],
    [-12, 0, 8],
    [12, 0, 8],
    // 2 central flanking columns
    [-4, 0, -2],
    [4, 0, -2],
  ];

  return (
    <group name="gallery-columns">
      {columnPositions.map((position, index) => (
        <DoricColumn key={index} position={position} radius={0.5} height={6} />
      ))}
    </group>
  );
}

import { useRef, useMemo, useEffect, Suspense } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { GalleryArtifact } from '@/types/gallery';

interface ArtworkFrameProps {
  artifact?: GalleryArtifact | null;
  position: [number, number, number];
  rotation: [number, number, number];
  isNearby: boolean;
  variantIndex?: number;
  onClick?: () => void;
}

const FRAME_WIDTH = 1.2;
const FRAME_HEIGHT = 1.0;
const FRAME_DEPTH = 0.08;
const BORDER_WIDTH = 0.06;

/**
 * Inner component that loads and displays the artwork texture
 * This suspends until the texture is loaded
 */
function ArtworkCanvas({ imageUrl }: { imageUrl: string }) {
  const texture = useTexture(imageUrl);

  // Configure texture
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
  }, [texture]);

  return (
    <mesh position={[0, 0, FRAME_DEPTH / 2 + 0.001]}>
      <planeGeometry args={[FRAME_WIDTH, FRAME_HEIGHT]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

/**
 * Placeholder shown while texture is loading
 */
function ArtworkPlaceholder() {
  return (
    <mesh position={[0, 0, FRAME_DEPTH / 2 + 0.001]}>
      <planeGeometry args={[FRAME_WIDTH, FRAME_HEIGHT]} />
      <meshBasicMaterial color="#2a2a3e" />
    </mesh>
  );
}

export function ArtworkFrame({
  artifact,
  position,
  rotation,
  isNearby,
  variantIndex = 0,
  onClick,
}: ArtworkFrameProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Get the current variant's image URL (only if artifact exists)
  const imageUrl = artifact?.variants[variantIndex]?.imageUrl ?? artifact?.variants[0]?.imageUrl;

  // Memoize frame material to prevent recreation on every render
  const frameMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#8B4513', // Base wood color
      roughness: 0.3,
      metalness: 0.1,
    });
  }, []);

  // Update frame material properties when isNearby changes
  useEffect(() => {
    frameMaterial.color.set(isNearby ? '#D4AF37' : '#8B4513');
    frameMaterial.metalness = isNearby ? 0.6 : 0.1;
    frameMaterial.needsUpdate = true;
  }, [isNearby, frameMaterial]);

  // Dispose frame material on unmount
  useEffect(() => {
    return () => {
      frameMaterial.dispose();
    };
  }, [frameMaterial]);

  // Memoize plaque material
  const plaqueMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({ color: '#1a1a2e' });
  }, []);

  // Dispose plaque material on unmount
  useEffect(() => {
    return () => {
      plaqueMaterial.dispose();
    };
  }, [plaqueMaterial]);

  const handleClick = onClick && artifact ? onClick : undefined;

  return (
    <group ref={groupRef} position={position} rotation={rotation} onClick={handleClick}>
      {/* Frame border */}
      <mesh castShadow>
        <boxGeometry args={[FRAME_WIDTH + BORDER_WIDTH * 2, FRAME_HEIGHT + BORDER_WIDTH * 2, FRAME_DEPTH]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>

      {/* Canvas/artwork with suspense for texture loading */}
      {imageUrl ? (
        <Suspense key={imageUrl} fallback={<ArtworkPlaceholder />}>
          <ArtworkCanvas imageUrl={imageUrl} />
        </Suspense>
      ) : (
        <ArtworkPlaceholder />
      )}

      {/* Spotlight above frame */}
      <spotLight
        position={[0, 0.8, 0.5]}
        angle={0.4}
        penumbra={0.5}
        intensity={isNearby ? 2 : 1}
        color="#FFF8DC"
        castShadow={false}
      />

      {/* Name plaque */}
      {isNearby && (
        <mesh position={[0, -(FRAME_HEIGHT / 2 + 0.15), 0.05]}>
          <planeGeometry args={[0.8, 0.12]} />
          <primitive object={plaqueMaterial} attach="material" />
        </mesh>
      )}
    </group>
  );
}

import { useRef, useMemo, useEffect, useState, useCallback, Suspense } from 'react';
import { useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { GalleryArtifact } from '@/types/gallery';

interface ArtworkFrameProps {
  artifact?: GalleryArtifact | null;
  position: [number, number, number];
  rotation: [number, number, number];
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
}: ArtworkFrameProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Track current display index: 0 = original, 1+ = variants
  const [displayIndex, setDisplayIndex] = useState(0);

  // Build array of all images: [original, ...variants]
  const allImages = useMemo(() => {
    if (!artifact) return [];
    const images: { url: string; label: string }[] = [
      { url: artifact.originalImageUrl, label: 'Original' },
    ];
    artifact.variants.forEach((v) => {
      images.push({ url: v.imageUrl, label: v.colorScheme });
    });
    return images;
  }, [artifact]);

  // Get current image URL
  const currentImage = allImages[displayIndex] || allImages[0];
  const imageUrl = currentImage?.url;

  // Click handler to cycle through images
  const handleClick = useCallback(() => {
    if (allImages.length > 1) {
      setDisplayIndex((prev) => (prev + 1) % allImages.length);
    }
  }, [allImages.length]);

  // Memoize frame material to prevent recreation on every render
  const frameMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#8B4513', // Wood color
      roughness: 0.3,
      metalness: 0.1,
    });
  }, []);

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

  // Truncate long titles
  const displayTitle = artifact?.name
    ? artifact.name.length > 20
      ? artifact.name.substring(0, 18) + '...'
      : artifact.name
    : '';

  return (
    <group ref={groupRef} position={position} rotation={rotation} onClick={artifact ? handleClick : undefined}>
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
        intensity={1.2}
        color="#FFF8DC"
        castShadow={false}
      />

      {/* Title label below frame */}
      {artifact && (
        <group position={[0, -(FRAME_HEIGHT / 2 + 0.12), 0.05]}>
          {/* Plaque background */}
          <mesh>
            <planeGeometry args={[FRAME_WIDTH, 0.15]} />
            <primitive object={plaqueMaterial} attach="material" />
          </mesh>
          {/* Title text */}
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.06}
            color="#D4AF37"
            anchorX="center"
            anchorY="middle"
            maxWidth={FRAME_WIDTH - 0.1}
          >
            {displayTitle}
          </Text>
          {/* Variant indicator */}
          {allImages.length > 1 && (
            <Text
              position={[0, -0.055, 0.01]}
              fontSize={0.035}
              color="#888888"
              anchorX="center"
              anchorY="middle"
            >
              {currentImage?.label} ({displayIndex + 1}/{allImages.length})
            </Text>
          )}
        </group>
      )}
    </group>
  );
}

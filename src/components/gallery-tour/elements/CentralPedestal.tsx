import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function CentralPedestal() {
  const vaseRef = useRef<THREE.Mesh>(null)

  // Stone material for the base
  const stoneMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#A89080',
        roughness: 0.85,
      }),
    []
  )

  // Terracotta material for the vase
  const terracottaMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#C4725F',
        roughness: 0.7,
      }),
    []
  )

  // Lathe geometry for amphora/vase shape
  const vaseGeometry = useMemo(() => {
    const points: THREE.Vector2[] = []
    // Base
    points.push(new THREE.Vector2(0.05, 0))
    points.push(new THREE.Vector2(0.15, 0.02))
    // Lower body
    points.push(new THREE.Vector2(0.18, 0.1))
    points.push(new THREE.Vector2(0.22, 0.25))
    // Widest part (belly)
    points.push(new THREE.Vector2(0.25, 0.4))
    points.push(new THREE.Vector2(0.22, 0.55))
    // Shoulder
    points.push(new THREE.Vector2(0.15, 0.65))
    // Neck
    points.push(new THREE.Vector2(0.08, 0.7))
    points.push(new THREE.Vector2(0.07, 0.8))
    // Lip
    points.push(new THREE.Vector2(0.1, 0.85))
    points.push(new THREE.Vector2(0.1, 0.88))
    points.push(new THREE.Vector2(0.07, 0.88))

    return new THREE.LatheGeometry(points, 32)
  }, [])

  // Slowly rotate the vase
  useFrame((_, delta) => {
    if (vaseRef.current) {
      vaseRef.current.rotation.y += 0.1 * delta
    }
  })

  // Dispose materials on unmount
  useEffect(() => {
    return () => {
      stoneMaterial.dispose()
      terracottaMaterial.dispose()
      vaseGeometry.dispose()
    }
  }, [stoneMaterial, terracottaMaterial, vaseGeometry])

  return (
    <group position={[0, 0, -2]}>
      {/* 3-step stone base */}
      {/* Bottom step - 1.5m wide */}
      <mesh position={[0, 0.1, 0]} material={stoneMaterial}>
        <boxGeometry args={[1.5, 0.2, 1.5]} />
      </mesh>

      {/* Middle step - 1.2m wide */}
      <mesh position={[0, 0.3, 0]} material={stoneMaterial}>
        <boxGeometry args={[1.2, 0.2, 1.2]} />
      </mesh>

      {/* Top step - 0.9m wide */}
      <mesh position={[0, 0.5, 0]} material={stoneMaterial}>
        <boxGeometry args={[0.9, 0.2, 0.9]} />
      </mesh>

      {/* Decorative amphora/vase on top */}
      <mesh
        ref={vaseRef}
        position={[0, 0.6, 0]}
        geometry={vaseGeometry}
        material={terracottaMaterial}
      />
    </group>
  )
}

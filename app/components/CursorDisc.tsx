import * as THREE from 'three'

interface CursorDiscProps {
  position: THREE.Vector3
}

export function CursorDisc({ position }: CursorDiscProps) {
  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <circleGeometry args={[1.5, 32]} />
      <meshBasicMaterial
        color="#4ade80"
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

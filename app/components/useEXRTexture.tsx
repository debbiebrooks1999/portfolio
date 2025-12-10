// components/useEXRTexture.tsx
import { useLoader } from '@react-three/fiber'
import { EXRLoader } from 'three-stdlib' 
import * as THREE from 'three'

export function useEXRTexture(url: string) {
  const texture = useLoader(EXRLoader, url)
  
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.generateMipmaps = false
  
  return texture
}
declare module 'troika-three-text' {
  import * as THREE from 'three';
  
  export class Text extends THREE.Object3D {
    text: string;
    fontSize: number;
    color: number | string;
    textAlign: string;
    anchorX: string;
    anchorY: string;
    letterSpacing: number;
    lineHeight: number;
    font: string;
    material: THREE.Material;
    
    // Extrusion/3D properties
    depthOffset: number;
    
    // Outline/stroke properties
    outlineWidth: number;
    outlineColor: number | string;
    outlineOpacity: number;
    strokeWidth: number;
    strokeColor: number | string;
    
    // Other properties
    fillOpacity: number;
    maxWidth: number;
    whiteSpace: string;
    overflowWrap: string;
    
    sync: () => void;
    dispose: () => void;
  }
}
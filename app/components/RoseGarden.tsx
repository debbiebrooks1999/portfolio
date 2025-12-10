import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { RoseGardenScene } from './RoseGardenScene'

export default function RoseGarden() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)' }}>
      {/* Info Panel */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        color: 'white',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '10px',
        maxWidth: '320px',
        zIndex: 1000
      }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#4ade80' }}>
          🌹 Dynamic Rose Garden
        </h2>
        <div style={{ fontSize: '14px', margin: '5px 0', padding: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '5px' }}>
          <span style={{ color: '#4ade80', fontWeight: 'bold' }}>Move mouse</span> over ground
        </div>
        <div style={{ fontSize: '14px', margin: '5px 0', padding: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '5px' }}>
          Roses grow where you <span style={{ color: '#4ade80', fontWeight: 'bold' }}>hover</span>
        </div>
        <div style={{ fontSize: '14px', margin: '5px 0', padding: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '5px' }}>
          3 animated yard_grass patches!
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 10, 18], fov: 75 }}
        style={{ cursor: 'none' }}
      >
        <RoseGardenScene />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  )
}

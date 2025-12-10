// components/WallInstructions.tsx
import React, { useEffect, useState } from 'react'

type Props = {
  show: boolean
  onDismiss?: () => void
}

const WallInstructions: React.FC<Props> = ({ show, onDismiss }) => {
  const [dismissed, setDismissed] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    // Auto-dismiss after first interaction
    const handleClick = () => {
      if (!hasInteracted) {
        setHasInteracted(true)
        setTimeout(() => {
          setDismissed(true)
          onDismiss?.()
        }, 500)
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [hasInteracted, onDismiss])

  if (dismissed || !show) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '1rem 2rem',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '2px solid #39ff14',
        borderRadius: '12px',
        color: '#39ff14',
        fontFamily: 'monospace',
        fontSize: '1rem',
        fontWeight: 'bold',
        textAlign: 'center',
        zIndex: 1000,
        boxShadow: '0 0 20px rgba(57, 255, 20, 0.3), inset 0 0 20px rgba(57, 255, 20, 0.1)',
        animation: 'pulse 2s ease-in-out infinite',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >

      
      {/* <div style={{ marginBottom: '0.5rem' }}>
     
      </div>
      <div style={{ 
        fontSize: '0.85rem', 
        opacity: 0.8,
        color: '#00ffff',
      }}>
       
      </div> */}
      {/* <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          50% {
            opacity: 0.7;
            transform: translateX(-50%) translateY(-5px);
          }
        }
      `}</style> */}

    </div>


  )
}

export default WallInstructions

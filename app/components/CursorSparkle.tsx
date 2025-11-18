// components/CursorSparkle.tsx
import { useEffect, useMemo, useRef } from 'react';

type Particle = {
  x: number
  y: number
  size: number
  opacity: number
  vx: number
  vy: number
  color: string
  life: number
}

type Props = {
  enabled?: boolean
  cursorImage?: string
  cursorSize?: number
  particleColors?: string[]
  particleCount?: number
}

const CursorSparkle: React.FC<Props> = ({
  enabled = true,
  cursorImage = '/spray.png', 
  cursorSize = 100,
  particleColors = [
    '#39ff14', // neon green
    '#00ffff', // cyan
    '#ff00ff', // magenta
    '#ffff00', // yellow
  ],
  particleCount = 3,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const cursorImgRef = useRef<HTMLImageElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) {
      document.body.style.cursor = 'auto'
      return
    }

    // Hide default cursor
    document.body.style.cursor = 'none'

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    updateCanvasSize()

    // Load cursor image
    // const img = new Image()
    // img.src = cursorImage
    // cursorImgRef.current = img

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }

      // Create sparkle particles
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 10,
          y: e.clientY + (Math.random() - 0.5) * 10,
          size: Math.random() * 10 + 5,
          opacity: 1,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2 - 1,
          color: particleColors[Math.floor(Math.random() * particleColors.length)],
          life: 1,
        })
      }

      // Limit particle count
      if (particlesRef.current.length > 100) {
        particlesRef.current = particlesRef.current.slice(-100)
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05 // gravity
        p.opacity -= 0.02
        p.size *= 0.96
        p.life -= 0.02

        if (p.life <= 0 || p.opacity <= 0) return false

        // Draw particle
        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        ctx.shadowBlur = 10
        ctx.shadowColor = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        return true
      })

      // Draw custom cursor
      // const { x, y } = mouseRef.current
      // if (cursorImgRef.current?.complete) {
      //   ctx.save()
      //   ctx.shadowBlur = 15
      //   ctx.shadowColor = particleColors[0]
      //   ctx.drawImage(
      //     cursorImgRef.current,
      //     x - cursorSize / 2,
      //     y - cursorSize / 2,
      //     cursorSize,
      //     cursorSize
      //   )
      //   ctx.restore()
      // } else {
      //   // Fallback crosshair
      //   ctx.strokeStyle = particleColors[0]
      //   ctx.lineWidth = 2
      //   ctx.shadowBlur = 10
      //   ctx.shadowColor = particleColors[0]
      //   ctx.beginPath()
      //   ctx.moveTo(x - 10, y)
      //   ctx.lineTo(x + 10, y)
      //   ctx.moveTo(x, y - 10)
      //   ctx.lineTo(x, y + 10)
      //   ctx.stroke()
      // }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', updateCanvasSize)
    animate()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', updateCanvasSize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      document.body.style.cursor = 'auto'
    }
  }, [enabled, cursorImage, cursorSize, particleColors, particleCount])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}

export default CursorSparkle

// components/CursorManager.tsx
import { useEffect, useState } from "react"
import { useThree } from "@react-three/fiber"
import { onHoverModel } from "../events"

export default function CursorManager() {
  const { gl } = useThree()
  const [modelHovered, setModelHovered] = useState(false)

  useEffect(() => {
    const unsubscribe = onHoverModel((over) => {
      setModelHovered(over)
      
      // Direct DOM manipulation for reliability
      if (over) {
        gl.domElement.style.cursor = "pointer"
        document.body.style.cursor = "pointer"
      } else {
        gl.domElement.style.cursor = "auto"
        document.body.style.cursor = "auto"
      }
    })

    return unsubscribe
  }, [gl])

  return null
}
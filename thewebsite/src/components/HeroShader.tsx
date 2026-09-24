"use client"

import { useEffect, useRef } from "react"

interface HeroShaderProps {
  textRef?: React.RefObject<HTMLDivElement | null>
}

// Simple flickering "offline" screen effect
export function HeroShader({ textRef }: HeroShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let hPixels: ImageData | null = null
    let vPixels: ImageData | null = null

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const drawScanlines = () => {
      if (!ctx || !canvas) return

      const w = canvas.width
      const h = canvas.height

      // Generate scanlines (every 4 pixels)
      if (!hPixels || hPixels.width !== w) {
        hPixels = ctx.createImageData(w, h)
        for (let y = 0; y < h; y += 4) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4
            hPixels!.data[idx] = 0
            hPixels!.data[idx + 1] = 0
            hPixels!.data[idx + 2] = 0
            hPixels!.data[idx + 3] = 30 + Math.random() * 20
          }
        }
      }

      ctx.putImageData(hPixels, 0, 0)
    }

    const drawStatic = () => {
      if (!ctx || !canvas) return

      const w = canvas.width
      const h = canvas.height

      // Vertical static lines occasionally
      const shouldFlash = Math.random() > 0.97
      if (shouldFlash) {
        if (!vPixels || vPixels.width !== w) {
          vPixels = ctx.createImageData(w, h)
        }
        for (let y = 0; y < h; y += 2) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4
            const noise = Math.random() * 255
            vPixels!.data[idx] = noise
            vPixels!.data[idx + 1] = noise
            vPixels!.data[idx + 2] = noise
            vPixels!.data[idx + 3] = 15 + Math.random() * 25
          }
        }
        ctx.putImageData(vPixels, 0, 0)
      }
    }

    const drawGlitch = () => {
      if (!ctx || !canvas) return

      // Horizontal glitch shift occasionally
      if (Math.random() > 0.995) {
        const shiftX = (Math.random() - 0.5) * 20
        const shiftY = Math.floor(Math.random() * 30)
        const copyWidth = canvas.width
        const copyHeight = Math.floor(Math.random() * 10) + 2

        const imageData = ctx.getImageData(0, shiftY, copyWidth, copyHeight)
        ctx.putImageData(imageData, shiftX, shiftY + (Math.random() > 0.5 ? 3 : -3))
      }
    }

    const loop = () => {
      drawScanlines()
      drawStatic()
      drawGlitch()
      animationId = requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener("resize", resize)
    loop()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
}

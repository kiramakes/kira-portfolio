"use client"

import { useEffect, useRef, useState } from "react"

interface MagneticCursorProps {
  children: React.ReactNode
  strength?: number
  className?: string
}

export function MagneticCursor({
  children,
  strength = 0.3,
  className = "",
}: MagneticCursorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const dx = e.clientX - centerX
        const dy = e.clientY - centerY
        const maxDist = Math.max(rect.width, rect.height) / 2
        const normalizedDist = Math.min(Math.abs(dx) / maxDist, 1)
        const moveX = dx * strength * (1 - normalizedDist * 0.5)
        const moveY = dy * strength * (1 - normalizedDist * 0.5)
        setOffset({ x: moveX, y: moveY })
      }
      setPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [strength])

  return (
    <div
      ref={ref}
      className={`relative transition-transform duration-150 ease-out ${className}`}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        willChange: "transform",
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {children}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [radius, setRadius] = useState(30)
  const [hidden, setHidden] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.matchMedia("(max-width: 768px)").matches)
  }, [])

  useEffect(() => {
    if (isMobile) return

    const handleMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setRadius(40)
    }
    const handleEnter = () => {
      setRadius(60)
      setHidden(true)
    }
    const handleLeave = () => {
      setRadius(30)
      setHidden(false)
    }

    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseleave", handleLeave)

    document.addEventListener("mouseenter", handleEnter, true)

    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseleave", handleLeave)
      document.removeEventListener("mouseenter", handleEnter, true)
    }
  }, [isMobile])

  if (isMobile) return null

  return (
    <>
      <svg
        className="fixed top-0 left-0 pointer-events-none z-50"
        width="100"
        height="100"
        viewBox="0 0 100 100"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
        }}
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-white/30"
          style={{ transition: "r 0.15s ease" }}
        />
        <circle cx="50" cy="50" r="4" fill="currentColor" className="text-white" />
      </svg>

      <div
        className={`fixed top-0 left-0 pointer-events-none z-50 w-3 h-3 rounded-full bg-white transition-all duration-150 ${
          hidden ? "scale-0 opacity-0" : "scale-1 opacity-100"
        }`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
        }}
      />
    </>
  )
}

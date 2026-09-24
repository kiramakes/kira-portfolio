"use client"

import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

interface GlowCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
  delay?: number
}

export function GlowCard({
  children,
  className = "",
  glowColor = "rgba(255,255,255,0.15)",
  delay = 0,
}: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }
    }
    const el = ref.current
    el?.addEventListener("mousemove", handleMouseMove)
    return () => el?.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <motion.div
      ref={ref}
      className={`relative group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      style={{
        boxShadow: isHovered
          ? `0 0 40px 10px ${glowColor}, inset 0 0 40px 10px ${glowColor}`
          : "none",
        background: isHovered
          ? `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.08) 0%, transparent 60%), rgba(255,255,255,0.03)`
          : "rgba(255,255,255,0.03)",
      }}
    >
      {children}
    </motion.div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useLenisContext } from "@/components/LenisProvider"

export function ScrollProgressBar() {
  const lenis = useLenisContext()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!lenis) return

    const updateProgress = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      const p = h > 0 ? window.scrollY / h : 0
      setProgress(p)
    }

    updateProgress()
    window.addEventListener("scroll", updateProgress, { passive: true })
    return () => window.removeEventListener("scroll", updateProgress)
  }, [lenis])

  return (
    <div
      className="fixed top-0 left-0 h-0.5 w-0 bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500 transition-all duration-75 z-50"
      style={{ width: `${progress * 100}%` }}
    />
  )
}

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"

/**
 * Shared scroll state — single source of truth pattern from imfemambocus.
 * Every scroll-driven component reads from here, never from its own listener.
 */
export const scrollState = {
  progress: 0,
  vy: 0,
  currentSection: "",
  setProgress: (v: number) => { scrollState.progress = v },
  setVy: (v: number) => { scrollState.vy = v },
  setCurrentSection: (v: string) => { scrollState.currentSection = v },
}

/**
 * Device-aware rendering layer — from Creative-Folio's deviceTier.ts + frameGate.ts.
 * One source of truth for device capability. Components check this before
 * deciding render cost. No per-component innerWidth checks.
 */
export function useDeviceTier() {
  const [tier, setTier] = useState<"low" | "mid" | "high">("high")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // SSR-safe: default to high, refine on mount
    if (typeof window === "undefined") return
    setIsMounted(true)

    const memory = (navigator as any).deviceMemory ?? 8
    const cores = navigator.hardwareConcurrency ?? 8
    const touch = "ontouchstart" in window
    const dpr = window.devicePixelRatio ?? 1
    const width = window.innerWidth

    let result: "low" | "mid" | "high" = "high"

    if (touch || memory <= 4 || cores <= 4 || dpr <= 1 || width < 768) {
      result = "low"
    } else if (memory <= 8 || cores <= 8 || dpr <= 1.5) {
      result = "mid"
    }

    setTier(result)
  }, [])

  // Target FPS based on tier — from Creative-Folio's targetFps()
  const targetFps = tier === "high" ? 60 : tier === "mid" ? 30 : 15

  // Frame gate — from Creative-Folio's frameGate.ts
  // Coalesces canvas draws to target FPS while simulation still advances every frame
  const useFrameGate = useCallback(() => {
    if (tier === "high") return { shouldDraw: true, lastDrawTime: 0 }
    const interval = 1000 / targetFps
    const now = performance.now()
    // Implemented per-component using this hook's output
    return { shouldDraw: true, interval, lastTime: now }
  }, [tier, targetFps])

  return { tier, targetFps, isMounted }
}

/**
 * Common transition variants for page/component animations
 */
export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
}

export const slideIn = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

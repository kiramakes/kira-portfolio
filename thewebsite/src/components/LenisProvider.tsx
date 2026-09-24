"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import Lenis from "@studio-freight/lenis"

const LenisContext = createContext<Lenis | null>(null)

export function useLenisContext() {
  return useContext(LenisContext)
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return <LenisContext.Provider value={lenisRef.current}>{children}</LenisContext.Provider>
}

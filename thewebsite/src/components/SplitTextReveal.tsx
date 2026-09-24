"use client"

import { useRef, useEffect, useState } from "react"

interface SplitTextRevealProps {
  text: string
  className?: string
  delay?: number
}

export function SplitTextReveal({ text, className = "", delay = 0 }: SplitTextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [chars, setChars] = useState<Array<{ char: string; revealed: boolean }>>([])

  useEffect(() => {
    const split = text.split("").map((char) => ({
      char,
      revealed: false,
    }))
    // First character is revealed immediately
    split[0].revealed = true
    setChars(split)

    const timeout = setTimeout(() => {
      split.forEach((_, i) => {
        setTimeout(() => {
          split[i].revealed = true
          setChars([...split])
        }, i * 40)
      })
    }, delay)

    return () => clearTimeout(timeout)
  }, [text, delay])

  return (
    <span ref={ref} className={`inline-block font-bold leading-tight ${className}`}>
      {chars.map(({ char, revealed }, i) => (
        <span
          key={i}
          className={`inline-block transition-all duration-600 ${
            revealed ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
          }`}
          style={{ transitionDelay: `${i * 40}ms` }}
        >
          {char}
        </span>
      ))}
    </span>
  )
}

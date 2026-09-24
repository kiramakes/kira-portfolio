"use client"

import { useEffect, useRef, useState } from "react"

interface TypewriterProps {
  words: string[]
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
  className?: string
}

export function Typewriter({
  words,
  typingSpeed = 100,
  deletingSpeed = 60,
  pauseDuration = 2000,
  className = "",
}: TypewriterProps) {
  const [text, setText] = useState("")
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const currentWord = words[wordIndex]

    if (!isDeleting) {
      setText((prev) => prev + currentWord.charAt(text.length))
      if (text.length === currentWord.length) {
        timeoutRef.current = setTimeout(() => setIsDeleting(true), pauseDuration)
      } else {
        timeoutRef.current = setTimeout(() => {}, typingSpeed)
      }
    } else {
      setText((prev) => prev.slice(0, -1))
      if (text.length === 0) {
        setIsDeleting(false)
        setWordIndex((prev) => (prev + 1) % words.length)
      } else {
        timeoutRef.current = setTimeout(() => {}, deletingSpeed)
      }
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [text, wordIndex, isDeleting, words, typingSpeed, deletingSpeed, pauseDuration])

  return (
    <span className={`inline-block font-mono ${className}`}>
      {text}
      <span className="animate-pulse text-white/70">|</span>
    </span>
  )
}

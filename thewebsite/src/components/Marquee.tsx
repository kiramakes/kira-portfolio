"use client"

import { motion } from "framer-motion"

interface MarqueeProps {
  items: string[]
  speed?: number
}

export function Marquee({ items, speed = 30 }: MarqueeProps) {
  const doubled = [...items, ...items]

  return (
    <div className="overflow-hidden w-full">
      <div
        className="flex animate-marquee flex-nowrap items-center gap-8 w-max"
        style={{ animationDuration: `${speed}s` }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="text-base font-medium tracking-wide text-white/50 whitespace-nowrap">
            {item}
            <span className="mx-6 text-white/20">✦</span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
      `}</style>
    </div>
  )
}

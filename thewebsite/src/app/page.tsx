"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LenisProvider, useLenisContext } from "@/components/LenisProvider"
import { CustomCursor } from "@/components/CustomCursor"
import { MagneticCursor } from "@/components/MagneticCursor"
import { Marquee } from "@/components/Marquee"
import { GlowCard } from "@/components/GlowCard"
import { Typewriter } from "@/components/Typewriter"
import { ScrollProgressBar } from "@/components/ScrollProgressBar"
import { CommandPalette } from "@/components/CommandPalette"
import { HeroShader } from "@/components/HeroShader"
import { SplitTextReveal } from "@/components/SplitTextReveal"
import { useDeviceTier, scrollState } from "@/lib/animations"

const NAV_ITEMS = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
]

function PortfolioContent() {
  const lenis = useLenisContext()
  const heroRef = useRef<HTMLDivElement>(null)
  const deviceTier = useDeviceTier()
  const [activeSection, setActiveSection] = useState("work")
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    if (!lenis) return

    const onScroll = () => {
      const scrollPos = window.scrollY
      const docH = document.documentElement.scrollHeight - window.innerHeight
      scrollState.setProgress(docH > 0 ? scrollPos / docH : 0)

      let current = "work"
      for (const [id, el] of Object.entries(sectionRefs.current)) {
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) {
          current = id
        }
      }
      scrollState.setCurrentSection(current)
      if (current !== activeSection) setActiveSection(current)
    }

    lenis.on("scroll", onScroll)
    return () => lenis.off("scroll", onScroll)
  }, [lenis, activeSection])

  const registerSection = useCallback((id: string, el: HTMLElement | null) => {
    sectionRefs.current[id] = el
  }, [])

  const skills = [
    "React", "Next.js", "TypeScript", "Node.js", "Python",
    "PostgreSQL", "GraphQL", "AWS", "Docker", "Three.js",
    "Framer Motion", "GSAP", "Tailwind CSS", "shadcn/ui",
    "WebGL", "GLSL", "Redis", "Kafka", "Terraform",
  ]

  const projects = [
    {
      title: "Trading Dashboard",
      desc: "Real-time crypto trading interface with WebSocket feeds, live order book, and portfolio analytics.",
      tags: ["React", "WebSocket", "D3.js", "Redis"],
      color: "from-emerald-500/20 to-cyan-500/20",
    },
    {
      title: "3D Portfolio Engine",
      desc: "Scroll-driven WebGL experience with custom shaders, particle systems, and device-aware rendering.",
      tags: ["Three.js", "GLSL", "Next.js", "WebGL"],
      color: "from-violet-500/20 to-pink-500/20",
    },
    {
      title: "AI Content Pipeline",
      desc: "Automated content generation and distribution platform with LLM integration and multi-channel delivery.",
      tags: ["Python", "LangChain", "Redis", "Kafka"],
      color: "from-amber-500/20 to-orange-500/20",
    },
    {
      title: "Design System",
      desc: "Comprehensive component library with 200+ accessible components, dark mode, and internationalization.",
      tags: ["React", "Storybook", "TypeScript", "CSS"],
      color: "from-blue-500/20 to-indigo-500/20",
    },
    {
      title: "Real-time Collab",
      desc: "Multi-user collaborative workspace with CRDT-based sync, presence indicators, and offline support.",
      tags: ["TypeScript", "CRDT", "WebSocket", "IndexedDB"],
      color: "from-rose-500/20 to-red-500/20",
    },
    {
      title: "Data Viz Platform",
      desc: "Interactive data visualization platform handling millions of data points with WebGL rendering.",
      tags: ["D3.js", "WebGL", "Python", "Postgres"],
      color: "from-cyan-500/20 to-teal-500/20",
    },
  ]

  const workHistory = [
    { role: "Senior Developer", company: "Tech Corp", period: "2023 — Present", desc: "Leading frontend architecture and performance optimization for a platform with 2M+ users." },
    { role: "Full Stack Engineer", company: "StartupXYZ", period: "2021 — 2023", desc: "Built and shipped the core product from scratch, growing from 0 to 50K active users." },
    { role: "Frontend Developer", company: "Agency Co", period: "2019 — 2021", desc: "Delivered 30+ client projects across e-commerce, SaaS, and media industries." },
  ]

  const education = [
    { degree: "B.S. Computer Science", school: "State University", year: "2015 — 2019" },
    { degree: "AWS Solutions Architect", school: "Amazon Web Services", year: "2022" },
    { degree: "Google UX Design Certificate", school: "Google / Coursera", year: "2023" },
  ]

  const values = [
    { title: "Craft", desc: "Every pixel, every interaction, every performance metric — care about all of it." },
    { title: "Curiosity", desc: "Always exploring what's next: new APIs, new techniques, new ways to do old things better." },
    { title: "Craft over speed", desc: "Shipping fast matters, but never at the expense of quality that users feel." },
    { title: "Open source", desc: "Give back to the community that built the tools I stand on." },
  ]

  const featured = [
    { title: "Portfolio Website", desc: "The site you're looking at — Next.js 16, Framer Motion, Lenis, WebGL shaders, device-aware rendering, command palette.", tags: ["Next.js", "Framer Motion", "WebGL"], year: "2026" },
    { title: "Real-time Analytics", desc: "Dashboard processing 1M+ events per minute with sub-second aggregations and real-time alerting.", tags: ["Kafka", "Redis", "PostgreSQL"], year: "2025" },
    { title: "Design System v2", desc: "Complete overhaul with design tokens, accessibility audit, and documentation site.", tags: ["React", "Storybook", "A11y"], year: "2025" },
    { title: "CLI Toolchain", desc: "Internal tooling that reduced setup from 2 hours to 5 minutes across 200+ engineers.", tags: ["Rust", "Node.js", "CI/CD"], year: "2024" },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollProgressBar />
      <CommandPalette />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/[0.05] bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-5">
          <a href="#home" className="text-lg font-semibold tracking-tight text-white">Portfolio</a>
          <div className="hidden items-center gap-8 sm:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`relative transition-colors ${
                  activeSection === item.label
                    ? "text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {item.label}
                {activeSection === item.label && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </div>
          <a
            href="#contact"
            className="flex sm:hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} id="home" className="relative min-h-screen flex flex-col items-center justify-center px-8 overflow-hidden">
        <HeroShader />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[120px] animate-pulse" style={{ animationDuration: "6s" }} />
          <div className="absolute -bottom-40 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/12 blur-[120px] animate-pulse" style={{ animationDuration: "8s", animationDelay: "2s" }} />
          <div className="absolute top-1/3 right-1/3 h-96 w-96 rounded-full bg-pink-600/8 blur-[100px]" />
        </div>

        <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-4xl text-center"
        >
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-6 text-xs font-medium uppercase tracking-[0.25em] text-white/30">
            Creative Developer & Engineer
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="mb-8 text-5xl font-bold leading-[1.05] tracking-tight text-white lg:text-7xl xl:text-8xl">
            Building things that
            <br />
            <SplitTextReveal text="feel alive" className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent" delay={500} />
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="mb-12 max-w-2xl mx-auto text-lg leading-relaxed text-white/50">
            I craft immersive digital experiences — blending code, motion, and design
            to build interfaces people remember and products that stand out.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }} className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
            <MagneticCursor>
              <a href="#work" className="group flex h-13 w-56 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-violet-500/10">
                View my work
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </MagneticCursor>
            <MagneticCursor>
              <a href="#contact" className="flex h-13 w-56 items-center justify-center rounded-full border border-white/10 px-7 text-sm font-medium text-white/50 transition-colors hover:text-white hover:border-white/20">
                Get in touch
              </a>
            </MagneticCursor>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.4 }} className="mt-16 flex flex-col items-center gap-2 text-white/20">
            <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} className="h-px w-5 bg-gradient-to-b from-white/30 to-transparent" />
          </motion.div>
        </motion.div>

        <div className="pointer-events-none absolute left-0 right-0 h-full bg-gradient-to-b from-black via-transparent to-black" style={{ paddingTop: "50vh" }}>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
        </div>
      </section>

      {/* MARQUEE */}
      <section className="border-t border-white/[0.04] bg-white/[0.015]">
        <Marquee items={skills} speed={35} />
      </section>

      {/* WORK */}
      <section id="work" ref={(el) => registerSection("work", el)} className="flex flex-1 flex-col px-8 py-32">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }} className="mb-16 text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-white/30">Selected Work</p>
          <h2 className="text-3xl font-bold text-white lg:text-5xl">What I&apos;ve <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">built</span></h2>
          <p className="mt-4 max-w-lg mx-auto text-sm text-white/40">A selection of projects representing my approach to solving problems with code, design, and motion.</p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <GlowCard key={project.title} delay={i * 0.08}>
              <div className={`mb-5 h-44 w-full rounded-xl bg-gradient-to-br ${project.color} overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <span className="text-xs font-mono text-white/35">{project.tags[0]}</span>
                  <div className="flex gap-1">
                    {project.tags.slice(0, 3).map((t) => (
                      <span key={t} className="flex h-5 w-5 items-center justify-center rounded border border-white/10 text-[10px] text-white/30">{t[0]}</span>
                    ))}
                  </div>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-white">{project.title}</h3>
              <p className="mb-5 text-sm leading-relaxed text-white/40">{project.desc}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-xs text-white/35 transition-colors hover:border-white/10 hover:text-white/50">{tag}</span>
                ))}
              </div>
            </GlowCard>
          ))}
        </div>
      </section>

      {/* MARQUEE 2 */}
      <section className="border-t border-white/[0.04]">
        <Marquee items={["TypeScript", "React", "Next.js", "Node.js", "Python", "WebGL", "Framer Motion", "Tailwind", "Three.js", "AWS", "Docker", "GraphQL", "TypeScript", "React", "Next.js", "Node.js", "Python", "WebGL"]} speed={40} />
      </section>

      {/* ABOUT */}
      <section id="about" ref={(el) => registerSection("about", el)} className="border-t border-white/[0.05] flex flex-1 flex-col px-8 py-32">
        <div className="grid gap-16 max-w-5xl md:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-white/30">About</p>
            <h2 className="mb-8 text-3xl font-bold text-white lg:text-5xl">Code with <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">curiosity</span></h2>
            <div className="space-y-5 text-base leading-relaxed text-white/45">
              <p>I&apos;ve been building for the web for over 7 years — from frontend interfaces to full-stack systems handling real traffic at scale.</p>
              <p>These days I focus on the intersection of interactive design and engineering: WebGL experiences, scroll-driven narratives, and interfaces that reward exploration and feel alive.</p>
              <p>I believe the best software doesn&apos;t just work — it reacts to you, adapts to your context, and leaves an impression. That&apos;s what I chase.</p>
              <p>When not shipping code, I&apos;m studying emerging web technologies, contributing to open source, or hunting for the next challenge.</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: 0.1 }}>
            <div className="grid gap-6">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-white/30">Experience</p>
              {workHistory.map((item, i) => (
                <GlowCard key={i} delay={i * 0.06} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-white/30">{item.period}</p>
                      <p className="mt-1 text-lg font-semibold text-white">{item.role}</p>
                      <p className="text-sm text-violet-400">{item.company}</p>
                    </div>
                    <div className="h-10 w-px shrink-0 bg-white/5" />
                  </div>
                  <p className="mt-3 text-sm text-white/40">{item.desc}</p>
                </GlowCard>
              ))}
            </div>

            <div className="mt-10 grid gap-4">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-white/30">Education & Certifications</p>
              {education.map((e, i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <p className="text-sm font-medium text-white">{e.degree}</p>
                    <p className="text-xs text-white/30">{e.school}</p>
                  </div>
                  <span className="text-xs text-white/30">{e.year}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-20 border-t border-white/[0.05] pt-16">
          <p className="mb-10 text-xs font-medium uppercase tracking-[0.25em] text-white/30 text-center">What I value</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <GlowCard key={i} delay={i * 0.05} className="p-6">
                <h3 className="mb-2 text-sm font-semibold text-white">{v.title}</h3>
                <p className="text-sm text-white/40">{v.desc}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects" ref={(el) => registerSection("projects", el)} className="border-t border-white/[0.05] flex flex-1 flex-col px-8 py-32">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }} className="mb-16 text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-white/30">Projects</p>
          <h2 className="text-3xl font-bold text-white lg:text-5xl">Featured <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">projects</span></h2>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2">
          {featured.map((project, i) => (
            <GlowCard key={project.title} delay={i * 0.08}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="mb-1 text-xs text-white/30">{project.year}</p>
                  <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                </div>
                <div className="flex gap-1">
                  {project.tags.slice(0, 3).map((t) => (
                    <span key={t} className="flex h-6 w-6 items-center justify-center rounded border border-white/5 text-[10px] text-white-30">{t[0]}</span>
                  ))}
                </div>
              </div>
              <p className="text-sm leading-relaxed text-white/40">{project.desc}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span key={tag} className="rounded px-2.5 py-0.5 text-[11px] text-white/30 bg-white/[0.03] border border-white/5">{tag}</span>
                ))}
              </div>
            </GlowCard>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" ref={(el) => registerSection("contact", el)} className="border-t border-white/[0.05] flex flex-1 flex-col items-center justify-center px-8 py-32 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.25em] text-white/30">Get in touch</p>
          <h2 className="mb-6 text-3xl font-bold text-white lg:text-5xl">Let&apos;s build <span className="bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">something together</span></h2>
          <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-white/40">Whether it&apos;s a new project, a speaking opportunity, or just a conversation about creative development — I&apos;m always interested.</p>

          <div className="flex flex-col items-center gap-4">
            <MagneticCursor>
              <a href="mailto:hello@example.com" className="group flex h-13 w-64 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-violet-500/10">
                hello@example.com
                <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </MagneticCursor>
            <div className="flex gap-6 text-sm text-white/30">
              <a href="#" className="hover:text-white/60 transition-colors">GitHub</a>
              <a href="#" className="hover:text-white/60 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white/60 transition-colors">Twitter</a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.05] py-8 text-center">
        <div className="mx-auto flex flex-col items-center gap-4 px-8">
          <div className="flex items-center gap-6 text-sm text-white/25">
            <a href="#home" className="hover:text-white/50 transition-colors">Home</a>
            <span className="text-white/10">·</span>
            <a href="#work" className="hover:text-white/50 transition-colors">Work</a>
            <span className="text-white/10">·</span>
            <a href="#about" className="hover:text-white/50 transition-colors">About</a>
            <span className="text-white/10">·</span>
            <a href="#contact" className="hover:text-white/50 transition-colors">Contact</a>
          </div>
          <p className="text-xs text-white/20">&copy; {new Date().getFullYear()} Portfolio. Built with Next.js, Framer Motion & Lenis.</p>
          <p className="text-[10px] text-white/10">Press <kbd className="mx-1 rounded border border-white/10 bg-white/5 px-1 text-[10px]">⌘K</kbd> to open command palette</p>
        </div>
      </footer>

      <CustomCursor />
    </div>
  )
}

export default function Home() {
  return (
    <LenisProvider>
      <PortfolioContent />
    </LenisProvider>
  )
}

"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUp,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Code2,
  Terminal,
  ShieldCheck,
  Mail,
  ArrowRight,
} from "lucide-react";

const EASE_KINETIC = [0.16, 1, 0.3, 1] as const;

export default function FeaturedWorkSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section id="capabilities" className="relative z-20 mx-auto max-w-7xl px-6 py-24 sm:py-32">
      {/* Kinetic Header Section */}
      <div className="mb-16 flex flex-col items-start gap-4">
        {/* Top telemetry badge */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE_KINETIC }}
          className="inline-flex items-center gap-3 rounded-full border border-[#ff2fb9]/40 bg-[#ff2fb9]/10 px-4 py-1.5 text-[10px] font-mono uppercase tracking-[0.35em] text-[#ff2fb9] backdrop-blur-md shadow-[0_0_20px_rgba(255,47,185,0.2)]"
        >
          <span className="flex h-2 w-2 relative">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7ee8ff] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff2fb9]" />
          </span>
          <span className="font-extrabold">// 02. SYSTEM ARCHITECTURE</span>
          <span className="text-white/40">|</span>
          <span className="text-[#7ee8ff] font-bold">CORE CAPABILITIES</span>
        </motion.div>

        {/* Section title */}
        <div className="overflow-hidden">
          <motion.h2
            initial={prefersReduced ? {} : { y: "115%", rotate: 1.5 }}
            whileInView={{ y: "0%", rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.85, ease: EASE_KINETIC }}
            className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white"
          >
            ENGINEERING &{" "}
            <span className="inline-block text-[#7ee8ff] drop-shadow-[0_0_35px_rgba(126,232,255,0.5)] italic">
              PERFORMANCE
            </span>
          </motion.h2>
        </div>

        <motion.div
          initial={prefersReduced ? {} : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE_KINETIC }}
          style={{ transformOrigin: "left" }}
          className="h-[2px] w-48 sm:w-72 bg-gradient-to-r from-[#ff2fb9] via-[#7ee8ff] to-transparent shadow-[0_0_15px_#ff2fb9]"
        />

        <p className="max-w-2xl text-[13px] sm:text-[14px] leading-relaxed tracking-wider text-white/70">
          From AI-driven biomechanical interfaces to sub-second SSR web platforms, every layer is engineered for speed, responsiveness, and aesthetic precision.
        </p>
      </div>

      {/* Grid of Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE_KINETIC }}
          whileHover={{ y: -6 }}
          className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-[#0a0a14] to-black p-8 backdrop-blur-xl transition-all duration-300 hover:border-[#7ee8ff]/80 hover:shadow-[0_0_40px_rgba(126,232,255,0.2)]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#7ee8ff]/40 bg-[#7ee8ff]/10 text-[#7ee8ff] shadow-[0_0_20px_rgba(126,232,255,0.3)]">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="mt-6 text-xl font-extrabold uppercase tracking-tight text-white group-hover:text-[#7ee8ff] transition-colors">
            Full-Stack Next.js & Turbopack
          </h3>
          <p className="mt-3 text-[13px] leading-relaxed text-white/65">
            React 19 Server Components, zero-waterfall data fetching, dynamic SSR routing, and edge caching for sub-100ms response times.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-mono text-white/60">
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">App Router</span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">TypeScript</span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Tailwind CSS</span>
          </div>
        </motion.div>

        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE_KINETIC }}
          whileHover={{ y: -6 }}
          className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-[#0a0a14] to-black p-8 backdrop-blur-xl transition-all duration-300 hover:border-[#ff2fb9]/80 hover:shadow-[0_0_40px_rgba(255,47,185,0.2)]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff2fb9]/40 bg-[#ff2fb9]/10 text-[#ff2fb9] shadow-[0_0_20px_rgba(255,47,185,0.3)]">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="mt-6 text-xl font-extrabold uppercase tracking-tight text-white group-hover:text-[#ff2fb9] transition-colors">
            Computer Vision & Kinetic Motion
          </h3>
          <p className="mt-3 text-[13px] leading-relaxed text-white/65">
            Real-time MediaPipe face & gaze estimation, 60fps canvas renderers, spring-physics smoothing, and reactive cursor tracking.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-mono text-white/60">
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">MediaPipe AI</span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Canvas 2D</span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Framer Motion</span>
          </div>
        </motion.div>

        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE_KINETIC }}
          whileHover={{ y: -6 }}
          className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-[#0a0a14] to-black p-8 backdrop-blur-xl transition-all duration-300 hover:border-[#7ee8ff]/80 hover:shadow-[0_0_40px_rgba(126,232,255,0.2)]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <ShieldCheck className="h-6 w-6 text-[#7ee8ff]" />
          </div>
          <h3 className="mt-6 text-xl font-extrabold uppercase tracking-tight text-white group-hover:text-[#7ee8ff] transition-colors">
            Production Scalability & UI/UX
          </h3>
          <p className="mt-3 text-[13px] leading-relaxed text-white/65">
            Pixel-perfect mobile responsiveness, SEO optimization, high Lighthouse scores, and polished user experiences built to convert.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-mono text-white/60">
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Core Web Vitals</span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Cross-Device</span>
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Clean Architecture</span>
          </div>
        </motion.div>
      </div>

      {/* Get in touch banner */}
      <motion.div
        initial={prefersReduced ? {} : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: EASE_KINETIC }}
        className="mt-20 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-[32px] border border-white/10 bg-gradient-to-r from-[#7ee8ff]/10 via-[#0a0a14] to-[#ff2fb9]/10 p-8 sm:p-10 backdrop-blur-2xl"
      >
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#ff2fb9] font-bold">
            Available For Freelance & Full-Stack Projects
          </span>
          <h3 className="text-2xl sm:text-3xl font-black uppercase text-white">
            Let&apos;s build your next interface
          </h3>
        </div>

        <a
          id="contact"
          href="mailto:contact@example.com"
          className="group inline-flex items-center gap-3 rounded-2xl bg-white px-7 py-3.5 text-[11px] font-black uppercase tracking-[0.25em] text-black shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all hover:bg-[#7ee8ff] hover:shadow-[0_0_40px_#7ee8ff] active:scale-95"
        >
          <span>Get in touch</span>
          <Mail className="h-4 w-4 text-black" />
        </a>
      </motion.div>

      {/* Back to top smooth button */}
      <div className="mt-20 flex justify-center">
        <a
          href="#top"
          className="group inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-[10px] font-mono uppercase tracking-[0.3em] text-white/70 backdrop-blur-md transition-all duration-300 hover:border-[#7ee8ff] hover:text-[#7ee8ff] hover:shadow-[0_0_20px_rgba(126,232,255,0.4)]"
        >
          <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-1" />
          <span>Back to top</span>
        </a>
      </div>
    </section>
  );
}

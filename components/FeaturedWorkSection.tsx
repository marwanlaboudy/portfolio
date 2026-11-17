"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Sparkles,
  Smartphone,
  Layers,
  ArrowUp,
  Flame,
  Zap,
  Cpu,
} from "lucide-react";

const EASE_KINETIC = [0.16, 1, 0.3, 1] as const;

export default function FeaturedWorkSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section id="work" className="relative z-20 mx-auto max-w-7xl px-6 py-28 sm:py-36">
      {/* Background kinetic grid & neon speedlines */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#7ee8ff]/30 to-transparent" />
        <div className="absolute top-24 -left-48 h-96 w-96 rounded-full bg-[#7ee8ff]/10 blur-[130px]" />
        <div className="absolute bottom-20 -right-48 h-96 w-96 rounded-full bg-[#ff2fb9]/15 blur-[130px]" />
      </div>

      {/* Kinetic Header Section (Lando Norris style masked typography reveal) */}
      <div className="mb-20 flex flex-col items-start gap-5">
        {/* Top telemetry badge */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE_KINETIC }}
          className="inline-flex items-center gap-3 rounded-full border border-[#7ee8ff]/40 bg-[#7ee8ff]/10 px-4 py-1.5 text-[10px] font-mono uppercase tracking-[0.35em] text-[#7ee8ff] backdrop-blur-md shadow-[0_0_20px_rgba(126,232,255,0.2)]"
        >
          <span className="flex h-2 w-2 relative">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff2fb9] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7ee8ff]" />
          </span>
          <span className="font-extrabold">// 01. SELECTED WORK</span>
          <span className="text-white/40">|</span>
          <span className="text-[#ff2fb9] font-bold">2026 ARCHIVE</span>
        </motion.div>

        {/* Massive kinetic header with mask reveal */}
        <div className="overflow-hidden">
          <motion.h2
            initial={prefersReduced ? {} : { y: "115%", rotate: 2 }}
            whileInView={{ y: "0%", rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.85, ease: EASE_KINETIC }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-white"
          >
            FEATURED{" "}
            <span className="inline-block text-[#ff2fb9] drop-shadow-[0_0_40px_rgba(255,47,185,0.65)] italic">
              PROJECTS
            </span>
          </motion.h2>
        </div>

        {/* Animated expanding speedline */}
        <motion.div
          initial={prefersReduced ? {} : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE_KINETIC }}
          style={{ transformOrigin: "left" }}
          className="h-[2px] w-48 sm:w-72 bg-gradient-to-r from-[#7ee8ff] via-[#ff2fb9] to-transparent shadow-[0_0_15px_#7ee8ff]"
        />

        {/* Subtitle description */}
        <motion.p
          initial={prefersReduced ? {} : { opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE_KINETIC }}
          className="max-w-2xl text-[13px] sm:text-[14px] leading-relaxed tracking-wider text-white/70"
        >
          High-performance full-stack web architectures, interactive 3D interfaces, and responsive digital storefronts crafted with precision and kinetic fluidity.
        </motion.p>
      </div>

      {/* Project Cards (Lando Norris style high-impact cards with hover physics) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Card 1: Re Sapori */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 70, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE_KINETIC }}
          whileHover={{ y: -6, scale: 1.012 }}
          className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#0a0a14] via-[#06060c] to-black p-8 sm:p-10 backdrop-blur-2xl transition-all duration-500 hover:border-[#7ee8ff]/90 hover:shadow-[0_0_60px_rgba(126,232,255,0.35),inset_0_0_30px_rgba(126,232,255,0.15)]"
        >
          {/* Giant Watermarked F1 Number behind card */}
          <span className="pointer-events-none absolute -right-4 -bottom-10 select-none text-[10rem] sm:text-[13rem] font-black italic tracking-tighter text-white/[0.03] transition-colors group-hover:text-[#7ee8ff]/[0.08]">
            01
          </span>

          {/* Glowing ambient radial glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#7ee8ff]/10 blur-[90px] transition-all duration-700 group-hover:bg-[#7ee8ff]/25 group-hover:scale-125" />

          {/* Top metadata pill */}
          <div className="relative z-10 flex items-center justify-between pb-8">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-[#7ee8ff]">
              <Flame className="h-3.5 w-3.5 text-[#ff2fb9]" />
              <span>Culinary & E-Commerce</span>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[10px] font-mono text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.3)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              Live Site
            </span>
          </div>

          {/* Project Title */}
          <div className="relative z-10">
            <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white transition-colors duration-300 group-hover:text-[#7ee8ff]">
              Re Sapori
            </h3>
            <p className="mt-4 text-[13px] sm:text-[14px] leading-relaxed tracking-wide text-white/70">
              An Italian culinary digital experience featuring real-time menu browsing, mobile ordering, and fluid kinetic animations.
            </p>
          </div>

          {/* Tech Spec Tags */}
          <div className="relative z-10 mt-8 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-wider text-white/70">
            <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 transition-colors group-hover:border-[#7ee8ff]/30 group-hover:text-white">
              Next.js 16
            </span>
            <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 transition-colors group-hover:border-[#7ee8ff]/30 group-hover:text-white">
              React 19
            </span>
            <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 transition-colors group-hover:border-[#7ee8ff]/30 group-hover:text-white">
              Tailwind CSS
            </span>
            <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 transition-colors group-hover:border-[#7ee8ff]/30 group-hover:text-white">
              Framer Motion
            </span>
          </div>

          {/* Action Row */}
          <div className="relative z-10 mt-10 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10">
            <a
              href="https://resapori.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-[#7ee8ff] px-6 py-3 text-[11px] font-black uppercase tracking-[0.25em] text-black shadow-[0_0_25px_rgba(126,232,255,0.45)] transition-all duration-300 hover:bg-white hover:scale-105 hover:shadow-[0_0_40px_#7ee8ff] active:scale-95"
            >
              <span>Visit Site</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <div className="flex items-center gap-2 text-[11px] font-mono text-white/50">
              <Smartphone className="h-4 w-4 text-[#7ee8ff]" />
              <span>Interactive phone on Hero</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Mario Juice */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 70, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.22, ease: EASE_KINETIC }}
          whileHover={{ y: -6, scale: 1.012 }}
          className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#0a0a14] via-[#06060c] to-black p-8 sm:p-10 backdrop-blur-2xl transition-all duration-500 hover:border-[#ff2fb9]/90 hover:shadow-[0_0_60px_rgba(255,47,185,0.35),inset_0_0_30px_rgba(255,47,185,0.15)]"
        >
          {/* Giant Watermarked F1 Number behind card */}
          <span className="pointer-events-none absolute -right-4 -bottom-10 select-none text-[10rem] sm:text-[13rem] font-black italic tracking-tighter text-white/[0.03] transition-colors group-hover:text-[#ff2fb9]/[0.08]">
            02
          </span>

          {/* Glowing ambient radial glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#ff2fb9]/10 blur-[90px] transition-all duration-700 group-hover:bg-[#ff2fb9]/25 group-hover:scale-125" />

          {/* Top metadata pill */}
          <div className="relative z-10 flex items-center justify-between pb-8">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-[#ff2fb9]">
              <Zap className="h-3.5 w-3.5 text-[#7ee8ff]" />
              <span>Beverage & Brand Platform</span>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[10px] font-mono text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.3)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              Live Site
            </span>
          </div>

          {/* Project Title */}
          <div className="relative z-10">
            <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white transition-colors duration-300 group-hover:text-[#ff2fb9]">
              Mario Juice
            </h3>
            <p className="mt-4 text-[13px] sm:text-[14px] leading-relaxed tracking-wide text-white/70">
              Fresh and dynamic juice bar brand platform built with a mobile-first philosophy, vivid visuals, and high-conversion ordering UX.
            </p>
          </div>

          {/* Tech Spec Tags */}
          <div className="relative z-10 mt-8 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-wider text-white/70">
            <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 transition-colors group-hover:border-[#ff2fb9]/30 group-hover:text-white">
              App Router
            </span>
            <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 transition-colors group-hover:border-[#ff2fb9]/30 group-hover:text-white">
              TypeScript
            </span>
            <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 transition-colors group-hover:border-[#ff2fb9]/30 group-hover:text-white">
              Modern UI
            </span>
            <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 transition-colors group-hover:border-[#ff2fb9]/30 group-hover:text-white">
              Mobile First
            </span>
          </div>

          {/* Action Row */}
          <div className="relative z-10 mt-10 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10">
            <a
              href="https://mariojuice.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-[#ff2fb9] px-6 py-3 text-[11px] font-black uppercase tracking-[0.25em] text-black shadow-[0_0_25px_rgba(255,47,185,0.45)] transition-all duration-300 hover:bg-white hover:scale-105 hover:shadow-[0_0_40px_#ff2fb9] active:scale-95"
            >
              <span>Visit Site</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <div className="flex items-center gap-2 text-[11px] font-mono text-white/50">
              <Smartphone className="h-4 w-4 text-[#ff2fb9]" />
              <span>Interactive phone on Hero</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Kinetic Capabilities Banner */}
      <motion.div
        initial={prefersReduced ? {} : { opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, delay: 0.3, ease: EASE_KINETIC }}
        className="mt-20 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-r from-[#7ee8ff]/5 via-white/[0.02] to-[#ff2fb9]/5 p-8 sm:p-12 backdrop-blur-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 text-[#7ee8ff] font-mono text-xs uppercase tracking-[0.25em] font-extrabold">
              <Layers className="h-4 w-4" />
              <span>Full-Stack Next.js</span>
            </div>
            <p className="text-[12px] sm:text-[13px] text-white/60 leading-relaxed tracking-wide">
              App Router, Turbopack, React 19 Server Components, SSR, and API architectures built for maximum performance and sub-second execution.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 text-[#ff2fb9] font-mono text-xs uppercase tracking-[0.25em] font-extrabold">
              <Sparkles className="h-4 w-4" />
              <span>Interactive Vision & Motion</span>
            </div>
            <p className="text-[12px] sm:text-[13px] text-white/60 leading-relaxed tracking-wide">
              MediaPipe AI vision, 60fps canvas engines, spring physics, and kinetic interactions that bring interfaces to life.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 text-white font-mono text-xs uppercase tracking-[0.25em] font-extrabold">
              <Cpu className="h-4 w-4 text-[#7ee8ff]" />
              <span>Production Quality</span>
            </div>
            <p className="text-[12px] sm:text-[13px] text-white/60 leading-relaxed tracking-wide">
              Clean TypeScript, responsive cross-device layouts, sub-second load times, and pixel-perfect design craft.
            </p>
          </div>
        </div>
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

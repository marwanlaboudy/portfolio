"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Brain,
  Code2,
  Cpu,
  ExternalLink,
  Flame,
  Layers,
  Mail,
  Music,
  Radio,
  Sparkles,
  Zap,
} from "lucide-react";

const EASE_KINETIC = [0.16, 1, 0.3, 1] as const;

export default function ExperienceSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section id="experience" className="relative z-20 mx-auto max-w-7xl px-6 py-24 sm:py-32">
      {/* Background ambient speedline & radial blur */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#7ee8ff]/30 to-transparent" />
        <div className="absolute top-28 -left-48 h-96 w-96 rounded-full bg-[#7ee8ff]/10 blur-[130px]" />
        <div className="absolute bottom-20 -right-48 h-96 w-96 rounded-full bg-[#ff2fb9]/15 blur-[130px]" />
      </div>

      {/* Kinetic Header */}
      <div className="mb-20 flex flex-col items-start gap-5">
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
          <span className="font-extrabold">// 01. EXPERIENCE & LEADERSHIP</span>
          <span className="text-white/40">|</span>
          <span className="text-[#ff2fb9] font-bold">2026 ARCHIVE</span>
        </motion.div>

        <div className="overflow-hidden">
          <motion.h2
            initial={prefersReduced ? {} : { y: "115%", rotate: 2 }}
            whileInView={{ y: "0%", rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.85, ease: EASE_KINETIC }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white"
          >
            EXPERIENCE &{" "}
            <span className="inline-block text-[#ff2fb9] drop-shadow-[0_0_40px_rgba(255,47,185,0.65)] italic">
              LEADERSHIP
            </span>
          </motion.h2>
        </div>

        <motion.div
          initial={prefersReduced ? {} : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE_KINETIC }}
          style={{ transformOrigin: "left" }}
          className="h-[2px] w-48 sm:w-72 bg-gradient-to-r from-[#7ee8ff] via-[#ff2fb9] to-transparent shadow-[0_0_15px_#7ee8ff]"
        />

        <motion.p
          initial={prefersReduced ? {} : { opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE_KINETIC }}
          className="max-w-2xl text-[13px] sm:text-[14px] leading-relaxed tracking-wider text-white/70"
        >
          Specializing in artificial intelligence, real-time computer vision, brand architecture, and cutting-edge creative full-stack development.
        </motion.p>
      </div>

      {/* Experience Cards Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Card 1: AI Engineer */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE_KINETIC }}
          whileHover={{ y: -6 }}
          className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#0a0a14] via-[#06060c] to-black p-8 backdrop-blur-2xl transition-all duration-500 hover:border-[#7ee8ff]/85 hover:shadow-[0_0_50px_rgba(126,232,255,0.25)] flex flex-col justify-between"
        >
          <span className="pointer-events-none absolute -right-4 -bottom-10 select-none text-[8rem] font-black italic tracking-tighter text-white/[0.03] group-hover:text-[#7ee8ff]/[0.06] transition-colors">
            AI
          </span>

          <div>
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#7ee8ff]">
                Machine Intelligence
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-[#7ee8ff]/40 bg-[#7ee8ff]/10 px-3 py-1 text-[10px] font-mono text-[#7ee8ff]">
                <Brain className="h-3 w-3 text-[#7ee8ff]" />
                Engineering
              </span>
            </div>

            <h3 className="mt-6 text-3xl font-black uppercase tracking-tight text-white group-hover:text-[#7ee8ff] transition-colors">
              AI Engineer
            </h3>

            <p className="mt-3 text-[13px] leading-relaxed text-white/70">
              Architecting real-time computer vision pipelines, browser-based neural networks, 3D face mesh landmarking, and high-precision gaze estimation engines with continuous temporal smoothing.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-mono uppercase text-white/60">
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">MediaPipe AI</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">TensorFlow Lite</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Python & OpenCV</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Computer Vision</span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#7ee8ff]">
            <span>Real-time Biomechanics</span>
            <span className="text-white/40">60 FPS Native</span>
          </div>
        </motion.div>

        {/* Card 2: Co-Founder of Cheri Band */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE_KINETIC }}
          whileHover={{ y: -6 }}
          className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#0a0a14] via-[#06060c] to-black p-8 backdrop-blur-2xl transition-all duration-500 hover:border-[#ff2fb9]/85 hover:shadow-[0_0_50px_rgba(255,47,185,0.25)] flex flex-col justify-between"
        >
          <span className="pointer-events-none absolute -right-4 -bottom-10 select-none text-[8rem] font-black italic tracking-tighter text-white/[0.03] group-hover:text-[#ff2fb9]/[0.06] transition-colors">
            CB
          </span>

          <div>
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ff2fb9]">
                Co-Founder & Leadership
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-[#ff2fb9]/40 bg-[#ff2fb9]/10 px-3 py-1 text-[10px] font-mono text-[#ff2fb9]">
                <Music className="h-3 w-3 text-[#ff2fb9]" />
                Creative Dir.
              </span>
            </div>

            <h3 className="mt-6 text-3xl font-black uppercase tracking-tight text-white group-hover:text-[#ff2fb9] transition-colors">
              Cheri Band
            </h3>
            <p className="text-[11px] font-mono uppercase tracking-wider text-[#ff2fb9] mt-1 font-bold">
              Co-Founder & Creative Director
            </p>

            <p className="mt-3 text-[13px] leading-relaxed text-white/70">
              Co-founded and shaped the brand strategy, audio-visual stage identity, digital presence, and creative direction for Cheri Band, bridging music, performance, and modern multimedia.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-mono uppercase text-white/60">
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Brand Architecture</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Creative Direction</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Live Multimedia</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Digital Strategy</span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#ff2fb9]">
            <span>Brand & Audio-Visual</span>
            <span className="text-white/40">Live Production</span>
          </div>
        </motion.div>

        {/* Card 3: Full-Stack Creative Developer */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE_KINETIC }}
          whileHover={{ y: -6 }}
          className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#0a0a14] via-[#06060c] to-black p-8 backdrop-blur-2xl transition-all duration-500 hover:border-white/60 hover:shadow-[0_0_50px_rgba(255,255,255,0.15)] flex flex-col justify-between"
        >
          <span className="pointer-events-none absolute -right-4 -bottom-10 select-none text-[8rem] font-black italic tracking-tighter text-white/[0.03] group-hover:text-white/[0.06] transition-colors">
            FS
          </span>

          <div>
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/80">
                Web Architecture
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-mono text-white">
                <Code2 className="h-3 w-3 text-[#7ee8ff]" />
                Full-Stack
              </span>
            </div>

            <h3 className="mt-6 text-3xl font-black uppercase tracking-tight text-white group-hover:text-[#7ee8ff] transition-colors">
              Creative Dev
            </h3>

            <p className="mt-3 text-[13px] leading-relaxed text-white/70">
              Building high-performance digital storefronts and reactive web applications including <strong>Re Sapori</strong> (Italian culinary platform at resapori.com) and <strong>Mario Juice</strong> (vibrant brand storefront at mariojuice.com).
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-mono uppercase text-white/60">
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Next.js 16</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">React 19</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Turbopack</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Framer Motion</span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/70">
            <span>Production Platforms</span>
            <span className="text-[#7ee8ff]">resapori.com // mariojuice.com</span>
          </div>
        </motion.div>
      </div>

      {/* Featured Projects Highlight Row */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <a
          href="https://resapori.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl hover:border-[#7ee8ff] hover:bg-[#7ee8ff]/5 transition-all"
        >
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#7ee8ff]">Featured Client Site</span>
            <h4 className="text-xl font-bold text-white mt-1">Re Sapori</h4>
            <p className="text-xs text-white/60 mt-1">resapori.com</p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-[#7ee8ff] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </a>

        <a
          href="https://mariojuice.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl hover:border-[#ff2fb9] hover:bg-[#ff2fb9]/5 transition-all"
        >
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff2fb9]">Featured Client Site</span>
            <h4 className="text-xl font-bold text-white mt-1">Mario Juice</h4>
            <p className="text-xs text-white/60 mt-1">mariojuice.com</p>
          </div>
          <ArrowUpRight className="h-5 w-5 text-[#ff2fb9] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </a>
      </div>

      {/* Contact Banner */}
      <motion.div
        initial={prefersReduced ? {} : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: EASE_KINETIC }}
        className="mt-20 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-[32px] border border-white/10 bg-gradient-to-r from-[#7ee8ff]/10 via-[#0a0a14] to-[#ff2fb9]/10 p-8 sm:p-10 backdrop-blur-2xl"
      >
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#ff2fb9] font-bold">
            Available For AI & Engineering Roles / Freelance
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

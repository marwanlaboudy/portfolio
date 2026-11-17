"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import FaceLooker from "@/components/FaceLooker";
import { ArrowUpRight, Cpu, Sparkles, Radio } from "lucide-react";

export default function HeroPhysicalUnveil() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pin & Scrub progress across an expanded 280vh hero stage for extended scroll time
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 38,
    restDelta: 0.001,
  });

  // 1. Kinetic Typography Split ("MARWAN" left, "LABOUDY" right)
  // Extended scroll duration: stays centered longer, then slides outward gradually
  const titleLeftX = useTransform(smoothProgress, [0.12, 0.82], ["0%", "-140%"]);
  const titleRightX = useTransform(smoothProgress, [0.12, 0.82], ["0%", "+140%"]);
  const titleOpacity = useTransform(smoothProgress, [0, 0.6, 0.85], [1, 0.9, 0]);

  // 2. Central Portrait Scale & Dock into Top-Left Navbar
  const portraitScale = useTransform(smoothProgress, [0.12, 0.85], [1, 0.22]);
  const portraitX = useTransform(smoothProgress, [0.12, 0.85], ["0vw", "-36vw"]);
  const portraitY = useTransform(smoothProgress, [0.12, 0.85], ["0vh", "-41vh"]);

  // 3. Side Experience Badges (AI Engineer & Co-Founder of Cheri Band)
  const experienceOpacity = useTransform(smoothProgress, [0, 0.45, 0.72], [1, 0.85, 0]);
  const experienceScale = useTransform(smoothProgress, [0, 0.7], [1, 0.92]);
  const experienceLeftX = useTransform(smoothProgress, [0.15, 0.75], ["0%", "-40%"]);
  const experienceRightX = useTransform(smoothProgress, [0.15, 0.75], ["0%", "+40%"]);

  return (
    <section ref={containerRef} className="relative h-[280vh] w-full bg-[#07070a]">
      {/* Sticky 100vh Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between px-6 pb-8 pt-6 select-none">
        {/* Background ambient lighting */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -left-32 h-[560px] w-[560px] rounded-full bg-[#22d3ee]/12 blur-[170px]" />
          <div className="absolute -top-32 -right-32 h-[560px] w-[560px] rounded-full bg-[#ec4899]/14 blur-[180px]" />
        </div>

        {/* Top Navbar */}
        <header className="relative z-30 flex w-full max-w-7xl mx-auto items-center justify-between text-white">
          {/* Lando Norris style typographic lockup in white */}
          <a
            href="#top"
            className="group flex flex-col leading-[0.78] select-none text-left transition-transform duration-200 hover:opacity-90 active:scale-95"
            title="MARWAN LABOUDY"
          >
            <span className="font-logo-serif text-[26px] sm:text-[32px] font-bold uppercase text-white tracking-[0.06em]">
              MARWAN
            </span>
            <span className="font-logo-sans text-[22px] sm:text-[27px] font-black uppercase text-white tracking-[-0.035em]">
              LABOUDY
            </span>
          </a>

          {/* Top-Right: Kept clean with subtle live status indicator */}
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-white/50 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span>CAIRO // GLOBAL</span>
          </div>
        </header>

        {/* Giant Kinetic Typography ("MARWAN" left, "LABOUDY" right) */}
        <div className="pointer-events-none absolute inset-x-0 top-[15%] z-0 select-none text-center font-black uppercase leading-[0.85] tracking-tight">
          <motion.span
            style={{ x: titleLeftX, opacity: titleOpacity }}
            className="block text-[clamp(3.8rem,14vw,12.5rem)] text-[#22d3ee] drop-shadow-[0_0_45px_rgba(34,211,238,0.5)]"
          >
            Marwan
          </motion.span>
          <motion.span
            style={{ x: titleRightX, opacity: titleOpacity }}
            className="block text-[clamp(3.8rem,14vw,12.5rem)] text-[#ec4899] drop-shadow-[0_0_45px_rgba(236,72,153,0.55)]"
          >
            Laboudy
          </motion.span>
        </div>

        {/* Central Morphing Portrait: Scales down and docks into top-left HUD avatar */}
        <div className="relative z-20 flex-1 flex items-center justify-center pointer-events-auto">
          <motion.div
            style={{
              scale: portraitScale,
              x: portraitX,
              y: portraitY,
              willChange: "transform",
            }}
            className="origin-center"
          >
            <FaceLooker size={620} className="max-w-[90vw]" />
          </motion.div>
        </div>

        {/* Side Experience Badges (Replaced phone popups with user experience credentials) */}
        {/* Left Badge: AI Engineer */}
        <motion.div
          style={{
            opacity: experienceOpacity,
            scale: experienceScale,
            x: experienceLeftX,
          }}
          className="pointer-events-auto absolute left-4 sm:left-8 lg:left-12 top-[52vh] -translate-y-1/2 z-30 hidden sm:block max-w-[260px] lg:max-w-[280px]"
        >
          <div className="group rounded-2xl border border-white/10 bg-[#07070a]/80 p-4 backdrop-blur-xl shadow-[0_0_30px_rgba(34,211,238,0.12)] transition-all hover:border-[#22d3ee]/60 hover:shadow-[0_0_40px_rgba(34,211,238,0.25)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-[#22d3ee]">
                <Cpu className="h-3 w-3 text-[#22d3ee]" />
                Role // 01
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#22d3ee] shadow-[0_0_6px_#22d3ee]" />
            </div>
            <h3 className="mt-2.5 text-base font-black uppercase text-white tracking-tight">
              AI Engineer
            </h3>
            <p className="mt-1 text-[11px] text-white/70 leading-relaxed font-sans">
              Autonomous agent systems, Qwen/AraBERT NLP fine-tuning, automated Facebook lead scrapers & conversational bots.
            </p>
            <div className="mt-3 flex flex-wrap gap-1 text-[8.5px] font-mono uppercase text-[#22d3ee]">
              <span className="rounded bg-[#22d3ee]/10 border border-[#22d3ee]/30 px-1.5 py-0.5">Automations</span>
              <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-white/60">Lead Bots</span>
              <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-white/60">n8n Core</span>
            </div>
          </div>
        </motion.div>

        {/* Right Badge: Co-Founder Cheri Band */}
        <motion.div
          style={{
            opacity: experienceOpacity,
            scale: experienceScale,
            x: experienceRightX,
          }}
          className="pointer-events-auto absolute right-4 sm:right-8 lg:right-12 top-[52vh] -translate-y-1/2 z-30 hidden sm:block max-w-[260px] lg:max-w-[280px]"
        >
          <div className="group rounded-2xl border border-white/10 bg-[#07070a]/80 p-4 backdrop-blur-xl shadow-[0_0_30px_rgba(236,72,153,0.12)] transition-all hover:border-[#ec4899]/60 hover:shadow-[0_0_40px_rgba(236,72,153,0.25)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-[#ec4899]">
                <Radio className="h-3 w-3 text-[#ec4899]" />
                Role // 02
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#ec4899] shadow-[0_0_6px_#ec4899]" />
            </div>
            <h3 className="mt-2.5 text-base font-black uppercase text-white tracking-tight">
              Co-Founder // Cheri
            </h3>
            <p className="mt-1 text-[11px] text-white/70 leading-relaxed font-sans">
              Smart home hand gesture controller & continuous health tracker band using bio-signal sEMG and 6-axis IMU sensors.
            </p>
            <div className="mt-3 flex flex-wrap gap-1 text-[8.5px] font-mono uppercase text-[#ec4899]">
              <span className="rounded bg-[#ec4899]/10 border border-[#ec4899]/30 px-1.5 py-0.5">Gesture Band</span>
              <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-white/60">sEMG Sensor</span>
              <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-white/60">Edge ML</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar: Cleaned up with experience summary (scroll down button removed) */}
        <div className="relative z-30 mx-auto w-full max-w-7xl flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-white/70">
            <span className="text-[#22d3ee] font-bold">AI Engineer</span>
            <span className="text-white/30">•</span>
            <span className="text-[#ec4899] font-bold">Co-Founder Cheri Band</span>
            <span className="text-white/30">•</span>
            <span className="text-white/60 hidden md:inline">Media Buyer & Full-Stack</span>
          </div>

          <a
            id="contact"
            href="mailto:contact@example.com"
            className="group inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-white"
          >
            <span className="text-white/70 group-hover:text-[#22d3ee] transition-colors">
              Get in touch
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#22d3ee] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

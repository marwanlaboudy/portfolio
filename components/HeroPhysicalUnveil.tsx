"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import FaceLooker from "@/components/FaceLooker";
import ResaporiPhoneTrigger from "@/components/ResaporiPhoneTrigger";
import MarioJuicePhoneTrigger from "@/components/MarioJuicePhoneTrigger";
import { ArrowUpRight, ChevronDown, ExternalLink } from "lucide-react";

export default function HeroPhysicalUnveil() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pin & Scrub progress across the 200vh hero stage
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 40,
    restDelta: 0.001,
  });

  // 1. Kinetic Typography Split ("MARWAN" left, "LABOUDY" right)
  const titleLeftX = useTransform(smoothProgress, [0, 0.65], ["0%", "-135%"]);
  const titleRightX = useTransform(smoothProgress, [0, 0.65], ["0%", "+135%"]);
  const titleOpacity = useTransform(smoothProgress, [0, 0.5, 0.75], [1, 0.8, 0]);

  // 2. Central Portrait Scale & Dock into Top-Left Navbar Avatar
  const portraitScale = useTransform(smoothProgress, [0, 0.75], [1, 0.22]);
  const portraitX = useTransform(smoothProgress, [0, 0.75], ["0vw", "-36vw"]);
  const portraitY = useTransform(smoothProgress, [0, 0.75], ["0vh", "-41vh"]);
  const portraitBorderRadius = useTransform(smoothProgress, [0, 0.7], ["0%", "50%"]);
  const portraitGlow = useTransform(
    smoothProgress,
    [0, 0.75],
    ["drop-shadow(0 0 0px transparent)", "drop-shadow(0 0 16px #22d3ee)"]
  );

  // 3. Side Phone Badges morphing outward as you scroll
  const phoneTriggersOpacity = useTransform(smoothProgress, [0, 0.25, 0.55], [1, 1, 0]);
  const phoneTriggersScale = useTransform(smoothProgress, [0, 0.5], [1, 1.25]);

  // Bottom scroll cue fades out quickly on scroll
  const scrollCueOpacity = useTransform(smoothProgress, [0, 0.18], [1, 0]);
  const scrollCueY = useTransform(smoothProgress, [0, 0.18], [0, 20]);

  return (
    <section ref={containerRef} className="relative h-[200vh] w-full bg-[#07070a]">
      {/* Sticky 100vh Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between px-6 pb-8 pt-6 select-none">
        {/* Background ambient lighting */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -left-32 h-[560px] w-[560px] rounded-full bg-[#22d3ee]/12 blur-[170px]" />
          <div className="absolute -top-32 -right-32 h-[560px] w-[560px] rounded-full bg-[#ec4899]/14 blur-[180px]" />
        </div>

        {/* Top Navbar */}
        <header className="relative z-30 flex w-full max-w-7xl mx-auto items-center justify-between text-[11px] uppercase tracking-[0.35em] text-white">
          {/* Lando Norris style typographic lockup */}
          <div className="flex items-center gap-4">
            <a
              href="#top"
              className="group flex flex-col leading-[0.82] select-none text-left transition-transform duration-200 hover:opacity-90 active:scale-95"
              title="Marwan Laboudy"
            >
              <span className="font-logo-serif text-[22px] sm:text-[26px] font-black uppercase text-white tracking-tight">
                Marwan
              </span>
              <span className="font-logo-sans text-[18.5px] sm:text-[22px] font-black uppercase text-white tracking-[-0.025em]">
                Laboudy
              </span>
            </a>
          </div>

          {/* Top-Right Status Pill (Mirrored by footer magnetic CTA) */}
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1.5 text-[10px] font-mono tracking-widest text-emerald-300 backdrop-blur-md shadow-[0_0_15px_rgba(52,211,153,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </span>
            <span className="font-bold uppercase">AVAILABLE FOR WORK</span>
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
              borderRadius: portraitBorderRadius,
              filter: portraitGlow,
            }}
            className="origin-center transition-shadow duration-300"
          >
            <FaceLooker size={620} className="max-w-[90vw]" />
          </motion.div>
        </div>

        {/* Floating Phone Triggers (Morph outward on scroll) */}
        <motion.div
          style={{
            opacity: phoneTriggersOpacity,
            scale: phoneTriggersScale,
          }}
          className="pointer-events-auto"
        >
          <ResaporiPhoneTrigger />
          <MarioJuicePhoneTrigger />
        </motion.div>

        {/* Bottom Bar & Scroll CTA Pill */}
        <div className="relative z-30 mx-auto w-full max-w-7xl flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-4 sm:flex-row">
          <p className="text-[11px] font-mono uppercase tracking-[0.35em] text-white/70 text-center sm:text-left">
            Where ideas meet <span className="text-[#ec4899] font-bold">interface</span>
          </p>

          {/* Bottom Scroll Pill */}
          <motion.a
            href="#signal-trace"
            style={{ opacity: scrollCueOpacity, y: scrollCueY }}
            className="group inline-flex items-center gap-3 rounded-full border border-[#22d3ee]/60 bg-black/85 px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#22d3ee] shadow-[0_0_20px_rgba(34,211,238,0.35),inset_0_0_12px_rgba(34,211,238,0.2)] backdrop-blur-xl transition-all hover:border-[#ec4899] hover:text-[#ec4899] hover:scale-105 active:scale-95"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ec4899] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22d3ee] group-hover:bg-[#ec4899]" />
            </span>
            <span>SCROLL DOWN TO SEE THE REST OF MY WORK</span>
            <ChevronDown className="h-3.5 w-3.5 animate-bounce text-[#ec4899] group-hover:text-[#22d3ee]" />
          </motion.a>

          <a
            id="contact"
            href="mailto:contact@example.com"
            className="group inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.35em] text-white"
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

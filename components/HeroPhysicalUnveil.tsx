"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import FaceLooker from "@/components/FaceLooker";
import SmokeSequence from "@/components/SmokeSequence";
import ResaporiPhoneTrigger from "@/components/ResaporiPhoneTrigger";
import MarioJuicePhoneTrigger from "@/components/MarioJuicePhoneTrigger";
import { ArrowUpRight } from "lucide-react";

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

  // 2. Face -> smoke dissolve, scrubbed by scroll (transparent frame sequence).
  // The live gaze face hands over to frame 0 of the smoke (same crop/scale) so the merge is invisible.
  const smokeProgress = useTransform(smoothProgress, [0.06, 0.78], [0, 1], { clamp: true });
  const faceOpacity = useTransform(smoothProgress, [0.045, 0.06], [1, 0]);
  const smokeOpacity = useTransform(smoothProgress, [0.04, 0.06, 0.8, 0.92], [0, 1, 1, 0]);
  const portraitScale = useTransform(smoothProgress, [0, 0.8], [1, 1.12]);

  // 3. Side Phone Badges morphing outward / fading smoothly on scroll
  const phoneTriggersOpacity = useTransform(smoothProgress, [0, 0.18, 0.45], [1, 0.9, 0]);
  const phoneTriggersScale = useTransform(smoothProgress, [0, 0.45], [1, 1.1]);

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

        {/* Experience HUD Pill: Prominently showcasing credentials without displacing phone buttons */}
        <div className="relative z-30 mx-auto -mt-2 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22d3ee] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22d3ee]" />
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.22em] text-white/90">
              <span className="text-[#22d3ee] font-bold">AI Engineer</span>
              <span className="mx-2 text-white/30">•</span>
              <span className="text-[#ec4899] font-bold">Co-Founder of Cheri Band</span>
              <span className="mx-2 text-white/30 hidden sm:inline">•</span>
              <span className="text-white/70 font-medium hidden sm:inline">Media Buyer &amp; Full-Stack</span>
            </span>
          </div>
        </div>

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
            style={{ scale: portraitScale, willChange: "transform" }}
            className="relative origin-center"
          >
            {/* Live cursor-tracking face (fades out as the smoke takes over) */}
            <motion.div style={{ opacity: faceOpacity }}>
              <FaceLooker size={620} className="max-w-[90vw]" />
            </motion.div>

            {/* Scroll-scrubbed face -> smoke dissolve, transparent background */}
            <motion.div
              style={{ opacity: smokeOpacity }}
              className="pointer-events-none absolute inset-0"
            >
              <SmokeSequence progress={smokeProgress} size={620} className="max-w-[90vw]" />
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Phone Sites Buttons (Preserved in place on Left and Right) */}
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

        {/* Bottom Bar: Experience credential ticker & Get in Touch (scroll down button removed) */}
        <div className="relative z-30 mx-auto w-full max-w-7xl flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-white/70">
            <span className="text-[#22d3ee] font-bold">AI Engineer</span>
            <span className="text-white/30">•</span>
            <span className="text-[#ec4899] font-bold">Co-Founder Cheri Band</span>
            <span className="text-white/30">•</span>
            <span className="text-white/60 hidden md:inline">Full-Stack Web &amp; Media Buying</span>
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

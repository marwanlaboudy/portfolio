"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import FaceLooker from "@/components/FaceLooker";
import ResaporiPhoneTrigger from "@/components/ResaporiPhoneTrigger";
import MarioJuicePhoneTrigger from "@/components/MarioJuicePhoneTrigger";
import { ArrowUpRight } from "lucide-react";

export default function HeroPhysicalUnveil() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGyroActive, setIsGyroActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const handleState = (e: any) => {
      setIsGyroActive(!!e.detail);
    };
    window.addEventListener("vrTiltState", handleState);
    return () => window.removeEventListener("vrTiltState", handleState);
  }, []);

  // Reliable scroll tracking across desktop & mobile (0px to 950px of window scroll scrubs the hero stage)
  const { scrollY } = useScroll();

  const rawProgress = useTransform(scrollY, [0, 950], [0, 1], { clamp: true });

  const smoothProgress = useSpring(rawProgress, {
    stiffness: 240,
    damping: 38,
    restDelta: 0.001,
  });

  // 1. Kinetic Typography Split ("MARWAN" left, "LABOUDY" right)
  const titleLeftX = useTransform(smoothProgress, [0.12, 0.82], ["0%", "-140%"]);
  const titleRightX = useTransform(smoothProgress, [0.12, 0.82], ["0%", "+140%"]);
  const titleOpacity = useTransform(smoothProgress, [0, 0.6, 0.85], [1, 0.9, 0]);

  // 2. Central Portrait Scale & Position (Responsive: docks into top-left on desktop, stays centered on mobile)
  const portraitScale = useTransform(smoothProgress, [0.12, 0.85], [1, 0.22]);
  const portraitXDesktop = useTransform(smoothProgress, [0.12, 0.85], ["0vw", "-36vw"]);
  const portraitXMobile = useTransform(smoothProgress, [0.12, 0.85], ["0vw", "0vw"]);
  const portraitX = isMobile ? portraitXMobile : portraitXDesktop;

  const portraitYDesktop = useTransform(smoothProgress, [0.12, 0.85], ["0vh", "-41vh"]);
  const portraitYMobile = useTransform(smoothProgress, [0.12, 0.85], ["0vh", "-12vh"]);
  const portraitY = isMobile ? portraitYMobile : portraitYDesktop;

  // 3. Side Phone Badges: fades out immediately upon scrolling
  const phoneTriggersOpacity = useTransform(smoothProgress, [0, 0.08, 0.22], [1, 0.5, 0]);
  const phoneTriggersScale = useTransform(smoothProgress, [0, 0.22], [1, 0.95]);

  // 4. Mobile VR Tilt Button: stays completely stationary and fades out immediately when scrolling starts
  const vrTiltOpacity = useTransform(smoothProgress, [0, 0.08], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-[280vh] w-full bg-[#07070a]">
      {/* Sticky 100vh Viewport Stage */}
      <div className="sticky top-0 h-screen sm:h-screen min-h-screen h-[100dvh] w-full bg-[#07070a] overflow-hidden flex flex-col justify-between px-4 sm:px-6 pb-8 pt-6 select-none">
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

          {/* Mobile VR Tilt Toggle Button: Top-Right */}
          <div className="sm:hidden flex items-center pointer-events-auto">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("toggleVrTilt"))}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#22d3ee]/50 bg-black/85 px-3 py-1.5 text-[9.5px] font-mono uppercase tracking-[0.16em] text-[#22d3ee] shadow-[0_0_16px_rgba(34,211,238,0.35)] backdrop-blur-md active:scale-95 transition-all select-none"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isGyroActive
                    ? "bg-[#22d3ee] animate-pulse shadow-[0_0_8px_#22d3ee]"
                    : "bg-white/40"
                }`}
              />
              <span>{isGyroActive ? "VR: ON" : "VR TILT"}</span>
            </button>
          </div>
        </header>

        {/* Giant Kinetic Typography ("MARWAN" left, "LABOUDY" right) - Directly behind face on both mobile and laptop */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-[52%] sm:top-[15%] sm:translate-y-0 z-0 select-none text-center font-black uppercase leading-[0.85] tracking-tight">
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

        {/* Central Morphing Portrait: Scales down and docks into top-left HUD avatar with mask active */}
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

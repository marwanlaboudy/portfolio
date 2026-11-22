"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import FaceLooker from "@/components/FaceLooker";
import ResaporiPhoneTrigger from "@/components/ResaporiPhoneTrigger";
import MarioJuicePhoneTrigger from "@/components/MarioJuicePhoneTrigger";
import { ArrowUpRight, Camera } from "lucide-react";

export default function HeroPhysicalUnveil() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCamActive, setIsCamActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showCamPrompt, setShowCamPrompt] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
    };
    check();
    if (window.innerWidth < 640) {
      setShowCamPrompt(true);
    }
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const handleState = (e: any) => {
      const active = !!e.detail;
      setIsCamActive(active);
      if (active) setShowCamPrompt(false);
    };
    window.addEventListener("camTrackState", handleState);
    return () => window.removeEventListener("camTrackState", handleState);
  }, []);

  // Reliable scroll tracking across desktop & mobile (0px to 420px of window scroll scrubs the hero stage so there is no dead scroll after MARWAN LABOUDY exits)
  const { scrollY } = useScroll();

  const rawProgress = useTransform(scrollY, [0, 420], [0, 1], { clamp: true });

  const smoothProgress = useSpring(rawProgress, {
    stiffness: 260,
    damping: 36,
    restDelta: 0.001,
  });

  // 1. Kinetic Typography Split ("MARWAN" left, "LABOUDY" right)
  // Moves immediately in parallel with the mask's fast double-lighting & lightning flicker, exiting right as the section unpins
  const titleLeftX = useTransform(smoothProgress, [0.0, 0.96], ["0%", "-140%"]);
  const titleRightX = useTransform(smoothProgress, [0.0, 0.96], ["0%", "+140%"]);
  const titleOpacity = useTransform(smoothProgress, [0, 0.72, 0.98], [1, 0.9, 0]);

  // 2. Side Phone Badges: fades out immediately upon scrolling
  const phoneTriggersOpacity = useTransform(smoothProgress, [0, 0.15, 0.38], [1, 0.5, 0]);
  const phoneTriggersScale = useTransform(smoothProgress, [0, 0.38], [1, 0.95]);

  // 3. Mobile VR Tilt Button: stays completely stationary and fades out immediately when scrolling starts
  const vrTiltOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-[145vh] sm:h-[152vh] w-full bg-[#07070a]">
      {/* Sticky 100dvh Viewport Stage */}
      <div className="sticky top-0 h-[100dvh] w-full bg-[#07070a] overflow-hidden flex flex-col justify-between px-4 sm:px-6 pb-4 sm:pb-8 pt-4 sm:pt-6 select-none">
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

          {/* AI Camera Face Tracking Button: Available on BOTH Phone & Laptop */}
          <div className="flex items-center pointer-events-auto">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("toggleCamTrack"))}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 sm:px-4 sm:py-2 text-[9.5px] sm:text-[10.5px] font-mono uppercase tracking-[0.16em] backdrop-blur-md active:scale-95 transition-all select-none cursor-pointer ${
                isCamActive
                  ? "border-[#ec4899]/80 bg-[#ec4899]/15 text-white shadow-[0_0_20px_rgba(236,72,153,0.45)]"
                  : "border-[#22d3ee]/60 bg-black/85 text-[#22d3ee] hover:border-[#22d3ee] shadow-[0_0_16px_rgba(34,211,238,0.35)]"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isCamActive
                    ? "bg-[#ec4899] animate-pulse shadow-[0_0_8px_#ec4899]"
                    : "bg-[#22d3ee]"
                }`}
              />
              <Camera className="h-3.5 w-3.5" />
              <span>{isCamActive ? "FACE CAM: ON" : "AI FACE CAM"}</span>
            </button>
          </div>
        </header>

        {/* Camera Permission Prompt on Phone so user can allow camera face tracking right away */}
        {showCamPrompt && !isCamActive && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none pointer-events-auto">
            <div className="relative max-w-xs w-full rounded-2xl border border-[#22d3ee]/50 bg-[#090910] p-5 shadow-[0_0_40px_rgba(34,211,238,0.35)] text-white text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-[#22d3ee]/60 bg-[#22d3ee]/10 text-[#22d3ee] shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                <Camera className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#22d3ee]">
                AI Face Tracking
              </h3>
              <p className="mt-2 text-xs text-white/75 leading-relaxed">
                Allow camera access so the 3D mask detects where your face is looking and moves with you in real time.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCamPrompt(false);
                    window.dispatchEvent(new CustomEvent("toggleCamTrack"));
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#22d3ee] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#67e8f9] active:scale-95 transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                >
                  Allow Camera
                </button>
                <button
                  type="button"
                  onClick={() => setShowCamPrompt(false)}
                  className="py-2.5 px-3 rounded-xl border border-white/15 bg-white/5 text-white/70 hover:text-white text-xs active:scale-95 transition-all"
                >
                  Use Touch
                </button>
              </div>
            </div>
          </div>
        )}

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

        {/* Central Portrait: Stays in its place in the center, flickers with neon lighting and disappears in place on scroll */}
        <div className="relative z-20 flex-1 flex items-center justify-center pointer-events-auto">
          <div className="origin-center">
            <FaceLooker size={620} className="max-w-[72vw] sm:max-w-[90vw]" />
          </div>
        </div>

        {/* Floating Phone Sites Buttons (Preserved in place on Left/Right or Top/Bottom, above z-20 mask) */}
        <ResaporiPhoneTrigger />
        <MarioJuicePhoneTrigger />

        {/* Bottom Bar: Experience credential ticker & Get in Touch */}
        <div className="relative z-30 mx-auto w-full max-w-7xl flex items-center justify-between gap-2 border-t border-white/10 pt-3 sm:pt-4">
          <div className="flex items-center gap-1.5 sm:gap-3 text-[8.5px] sm:text-[11px] font-mono uppercase tracking-[0.11em] sm:tracking-[0.25em] text-white/70 whitespace-nowrap">
            <span className="text-[#22d3ee] font-bold">AI Engineer</span>
            <span className="text-white/30">•</span>
            <span className="text-[#ec4899] font-bold">Co-Founder Cheri Band</span>
            <span className="text-white/30 hidden md:inline">•</span>
            <span className="text-white/60 hidden md:inline">Full-Stack Web &amp; Media Buying</span>
          </div>

          <a
            id="contact"
            href="mailto:contact@example.com"
            className="group inline-flex items-center gap-1 sm:gap-2 text-[8.5px] sm:text-[11px] font-mono uppercase tracking-[0.11em] sm:tracking-[0.25em] text-white whitespace-nowrap shrink-0"
          >
            <span className="text-white/70 group-hover:text-[#22d3ee] transition-colors">
              Get in touch
            </span>
            <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#22d3ee] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

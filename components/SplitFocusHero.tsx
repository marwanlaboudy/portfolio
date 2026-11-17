"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import FaceLooker from "@/components/FaceLooker";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ExternalLink,
  Flame,
  Mail,
  RotateCw,
  Smartphone,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

const RESAPORI_URL = "https://resapori.com";
const MARIO_JUICE_URL = "https://mariojuice.com";

const EASE_KINETIC = [0.16, 1, 0.3, 1] as const;

export default function SplitFocusHero() {
  const trackRef = useRef<HTMLDivElement>(null);

  // Measure scroll progress over the 240vh track (0.0 -> 1.0)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // 1. Kinetic Typography Split ("MARWAN" moves left, "LABOUDY" moves right)
  const titleLeftX = useTransform(scrollYProgress, [0, 0.35], ["0%", "-75%"]);
  const titleRightX = useTransform(scrollYProgress, [0, 0.35], ["0%", "+75%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.05]);

  // 2. Portrait Scale & Glow Shift -> Docks into top-left navbar HUD Avatar
  const portraitScale = useTransform(scrollYProgress, [0.03, 0.42], [1, 0.088]);
  const portraitX = useTransform(scrollYProgress, [0.03, 0.42], ["0vw", "calc(-50vw + 42px)"]);
  const portraitY = useTransform(scrollYProgress, [0.03, 0.42], ["0vh", "calc(-50vh + 34px)"]);
  const portraitRadius = useTransform(scrollYProgress, [0.05, 0.38], ["0px", "9999px"]);
  const hudRingOpacity = useTransform(scrollYProgress, [0.25, 0.42], [0, 1]);

  // Unified dark-mode cyber grid background transition
  const cyberGridOpacity = useTransform(scrollYProgress, [0.08, 0.38], [0, 0.22]);

  // 3. Floating Cards Glide Inward and Expand
  // At scroll 0: resting at screen left and right edges (122px x 128px)
  // At scroll 0.1 -> 0.48: glides toward center and expands to full project card dimensions
  const leftCardX = useTransform(
    scrollYProgress,
    [0.08, 0.48],
    ["0px", "calc(50vw - 50% - 290px)"]
  );
  const rightCardX = useTransform(
    scrollYProgress,
    [0.08, 0.48],
    ["0px", "calc(-50vw + 50% + 290px)"]
  );

  const cardWidth = useTransform(scrollYProgress, [0.08, 0.48], [122, 540]);
  const cardHeight = useTransform(scrollYProgress, [0.08, 0.48], [128, 540]);
  const cardBorderRadius = useTransform(scrollYProgress, [0.08, 0.48], [18, 32]);

  // Fade from button face -> full card body
  const buttonFaceOpacity = useTransform(scrollYProgress, [0.06, 0.22], [1, 0]);
  const cardContentOpacity = useTransform(scrollYProgress, [0.22, 0.48], [0, 1]);

  // Section Header Fade-In at the top
  const headerOpacity = useTransform(scrollYProgress, [0.18, 0.42], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0.18, 0.42], [-40, 0]);

  // Hero bottom prompt and call-to-action fade out
  const heroPromptOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  // Phone preview modals
  const [activePreview, setActivePreview] = useState<"resapori" | "mario" | null>(null);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Close preview on escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActivePreview(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div ref={trackRef} className="relative h-[250vh]">
      {/* Sticky Fullscreen Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black text-white">
        {/* Ambient Neon Glows */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-40 top-1/4 h-[38rem] w-[38rem] rounded-full bg-[#22d3ee]/15 blur-[170px]" />
          <div className="absolute -right-40 top-1/3 h-[38rem] w-[38rem] rounded-full bg-[#ff2fb9]/20 blur-[170px]" />
        </div>

        {/* Unified Dark-Mode Cyber Grid (transitions in on scroll) */}
        <motion.div
          style={{ opacity: cyberGridOpacity }}
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(126,232,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,47,185,0.06)_1px,transparent_1px)] bg-[size:4rem_4rem]"
        />

        {/* Top Navbar */}
        <header className="relative z-30 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-[11px] uppercase tracking-[0.35em] text-white/80">
          <div className="flex items-center gap-3">
            {/* Dock Target for the HUD Avatar */}
            <div className="relative flex h-11 w-11 items-center justify-center">
              {/* HUD Avatar indicator ring */}
              <motion.div
                style={{ opacity: hudRingOpacity }}
                className="pointer-events-none absolute inset-0 rounded-full border border-[#7ee8ff] shadow-[0_0_15px_#7ee8ff,inset_0_0_10px_#ff2fb9]"
              />
              <span className="h-2 w-2 rounded-full bg-[#7ee8ff] shadow-[0_0_8px_#7ee8ff]" />
            </div>

            <span className="font-extrabold tracking-widest text-white">
              Marwan Laboudy
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#work"
              className="hidden sm:inline-block text-white/70 hover:text-[#7ee8ff] transition-colors"
            >
              Selected Work
            </a>
            <a
              href="#contact"
              className="text-[#ff2fb9] hover:text-[#7ee8ff] transition-colors font-bold"
            >
              Available for work
            </a>
          </div>
        </header>

        {/* Kinetic Typography Split ("MARWAN" left, "LABOUDY" right) */}
        <div className="pointer-events-none absolute inset-x-0 top-[12%] z-0 select-none text-center font-black uppercase leading-[0.85] tracking-tight">
          <motion.span
            style={{ x: titleLeftX, opacity: titleOpacity }}
            className="block text-[clamp(3.5rem,13vw,11.5rem)] text-[#7ee8ff] drop-shadow-[0_0_40px_rgba(34,211,238,0.45)]"
          >
            Marwan
          </motion.span>
          <motion.span
            style={{ x: titleRightX, opacity: titleOpacity }}
            className="block text-[clamp(3.5rem,13vw,11.5rem)] text-[#ff2fb9] drop-shadow-[0_0_40px_rgba(255,47,185,0.5)]"
          >
            Laboudy
          </motion.span>
        </div>

        {/* Revealed Section Header when scrolled into Selected Work stage */}
        <motion.div
          style={{ opacity: headerOpacity, y: headerY }}
          className="pointer-events-none absolute inset-x-0 top-20 sm:top-24 z-10 flex flex-col items-center text-center px-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7ee8ff]/40 bg-[#7ee8ff]/10 px-4 py-1 text-[10px] font-mono uppercase tracking-[0.3em] text-[#7ee8ff] backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-[#ff2fb9]" />
            <span>01 // Selected Work</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white">
            Featured <span className="text-[#ff2fb9] drop-shadow-[0_0_30px_rgba(255,47,185,0.5)] italic">Projects</span>
          </h2>
        </motion.div>

        {/* Portrait: Centered at 0%, smoothly scales down and docks into top-left HUD Avatar */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <motion.div
            style={{
              x: portraitX,
              y: portraitY,
              scale: portraitScale,
              borderRadius: portraitRadius,
            }}
            className="relative pointer-events-auto overflow-hidden shadow-[0_0_40px_rgba(126,232,255,0.3)]"
          >
            <FaceLooker size={640} className="max-w-[92vw]" />
          </motion.div>
        </div>

        {/* Hero Scroll Indicator Callout (fades out early in the scroll) */}
        <motion.div
          style={{ opacity: heroPromptOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-3 px-6 text-center"
        >
          <a
            href="#work"
            className="pointer-events-auto group relative inline-flex items-center gap-3 rounded-full border border-[#7ee8ff]/60 bg-black/85 px-6 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#7ee8ff] shadow-[0_0_20px_rgba(126,232,255,0.35),inset_0_0_12px_rgba(126,232,255,0.2)] backdrop-blur-xl transition-all duration-300 hover:border-[#ff2fb9] hover:text-[#ff2fb9] hover:shadow-[0_0_35px_rgba(255,47,185,0.6),inset_0_0_15px_rgba(255,47,185,0.3)] hover:scale-105 active:scale-95"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff2fb9] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#7ee8ff] group-hover:bg-[#ff2fb9] shadow-[0_0_8px_#7ee8ff]" />
            </span>
            <span>Scroll down to see the rest of my work</span>
            <ChevronDown className="h-4 w-4 animate-bounce text-[#ff2fb9] group-hover:text-[#7ee8ff]" />
          </a>
          <span className="text-[9px] uppercase tracking-[0.3em] text-white/40">
            Split-Focus Hero Unveils On Scroll
          </span>
        </motion.div>

        {/* FLOATING CARD 1: Re Sapori (Left edge -> Center Left full card) */}
        <motion.div
          style={{
            x: leftCardX,
            width: cardWidth,
            height: cardHeight,
            borderRadius: cardBorderRadius,
            maxHeight: "78vh",
            maxWidth: "90vw",
          }}
          className="absolute left-4 sm:left-8 lg:left-12 top-1/2 -translate-y-1/2 z-30 overflow-hidden border border-[#7ee8ff]/85 bg-[#080812]/95 backdrop-blur-2xl shadow-[0_0_35px_rgba(126,232,255,0.4),0_0_70px_rgba(255,47,185,0.25)] transition-colors"
        >
          {/* Collapsed Button Face (Visible at scroll 0%) */}
          <motion.div
            style={{ opacity: buttonFaceOpacity }}
            onClick={() => {
              setActivePreview("resapori");
              setIsIframeLoaded(false);
            }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-3 cursor-pointer select-none"
          >
            <span className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-[#7ee8ff]/70 bg-gradient-to-br from-[#7ee8ff]/20 to-[#ff2fb9]/25 text-[#7ee8ff] shadow-[0_0_20px_rgba(126,232,255,0.6)]">
              <Smartphone className="h-6 w-6 drop-shadow-[0_0_8px_rgba(126,232,255,0.9)]" />
              <span className="absolute -right-1 -top-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff2fb9] opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#7ee8ff] shadow-[0_0_8px_#7ee8ff]" />
              </span>
            </span>

            <div className="flex flex-col items-center text-center">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#7ee8ff] drop-shadow-[0_0_10px_rgba(126,232,255,0.85)]">
                Re Sapori
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#ff2fb9] drop-shadow-[0_0_10px_rgba(255,47,185,0.85)]">
                Website
              </span>
            </div>
          </motion.div>

          {/* Full-Size Showcase Card (Morphs in as cards glide to center) */}
          <motion.div
            style={{ opacity: cardContentOpacity }}
            className="flex h-full w-full flex-col justify-between p-6 sm:p-8"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-[#7ee8ff]">
                <Flame className="h-3.5 w-3.5 text-[#ff2fb9]" />
                <span>Restaurant & E-Commerce</span>
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[10px] font-mono text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                Live Production
              </span>
            </div>

            {/* Title & Description */}
            <div className="my-auto">
              <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
                Re Sapori
              </h3>
              <p className="mt-3 text-[12px] sm:text-[13px] leading-relaxed tracking-wide text-white/70">
                An Italian culinary digital experience featuring real-time menu browsing, mobile ordering, and fluid kinetic animations.
              </p>

              {/* Tech Tags */}
              <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-wider text-white/60">
                <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Next.js 16</span>
                <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">React 19</span>
                <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Tailwind CSS</span>
                <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Framer Motion</span>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              <a
                href={RESAPORI_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#7ee8ff] px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-black shadow-[0_0_20px_rgba(126,232,255,0.4)] transition-all hover:bg-white active:scale-95"
              >
                <span>Visit Site</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>

              <button
                type="button"
                onClick={() => {
                  setActivePreview("resapori");
                  setIsIframeLoaded(false);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-[#7ee8ff]/50 bg-black/60 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-[#7ee8ff] hover:bg-[#7ee8ff]/15 transition-all"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Live Phone View</span>
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* FLOATING CARD 2: Mario Juice (Right edge -> Center Right full card) */}
        <motion.div
          style={{
            x: rightCardX,
            width: cardWidth,
            height: cardHeight,
            borderRadius: cardBorderRadius,
            maxHeight: "78vh",
            maxWidth: "90vw",
          }}
          className="absolute right-4 sm:right-8 lg:right-12 top-1/2 -translate-y-1/2 z-30 overflow-hidden border border-[#ff2fb9]/85 bg-[#080812]/95 backdrop-blur-2xl shadow-[0_0_35px_rgba(255,47,185,0.4),0_0_70px_rgba(126,232,255,0.25)] transition-colors"
        >
          {/* Collapsed Button Face (Visible at scroll 0%) */}
          <motion.div
            style={{ opacity: buttonFaceOpacity }}
            onClick={() => {
              setActivePreview("mario");
              setIsIframeLoaded(false);
            }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-3 cursor-pointer select-none"
          >
            <span className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-[#ff2fb9]/70 bg-gradient-to-br from-[#ff2fb9]/25 to-[#7ee8ff]/20 text-[#ff2fb9] shadow-[0_0_20px_rgba(255,47,185,0.6)]">
              <Smartphone className="h-6 w-6 drop-shadow-[0_0_8px_rgba(255,47,185,0.9)]" />
              <span className="absolute -left-1 -top-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7ee8ff] opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#ff2fb9] shadow-[0_0_8px_#ff2fb9]" />
              </span>
            </span>

            <div className="flex flex-col items-center text-center">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#ff2fb9] drop-shadow-[0_0_10px_rgba(255,47,185,0.85)]">
                Mario Juice
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#7ee8ff] drop-shadow-[0_0_10px_rgba(126,232,255,0.85)]">
                Website
              </span>
            </div>
          </motion.div>

          {/* Full-Size Showcase Card (Morphs in as cards glide to center) */}
          <motion.div
            style={{ opacity: cardContentOpacity }}
            className="flex h-full w-full flex-col justify-between p-6 sm:p-8"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-[#ff2fb9]">
                <Zap className="h-3.5 w-3.5 text-[#7ee8ff]" />
                <span>Beverage Brand & Storefront</span>
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[10px] font-mono text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                Live Production
              </span>
            </div>

            {/* Title & Description */}
            <div className="my-auto">
              <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
                Mario Juice
              </h3>
              <p className="mt-3 text-[12px] sm:text-[13px] leading-relaxed tracking-wide text-white/70">
                Fresh and dynamic juice bar brand platform built with a mobile-first philosophy, vivid visuals, and high-conversion ordering UX.
              </p>

              {/* Tech Tags */}
              <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-wider text-white/60">
                <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">App Router</span>
                <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">TypeScript</span>
                <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Modern UI</span>
                <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Mobile First</span>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              <a
                href={MARIO_JUICE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#ff2fb9] px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-black shadow-[0_0_20px_rgba(255,47,185,0.4)] transition-all hover:bg-white active:scale-95"
              >
                <span>Visit Site</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>

              <button
                type="button"
                onClick={() => {
                  setActivePreview("mario");
                  setIsIframeLoaded(false);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-[#ff2fb9]/50 bg-black/60 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-[#ff2fb9] hover:bg-[#ff2fb9]/15 transition-all"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Live Phone View</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Interactive Mobile Phone Modal Viewport (When user clicks Phone View on either card) */}
      <AnimatePresence>
        {activePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePreview(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.88, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex flex-col w-[350px] h-[640px] max-h-[90vh] max-w-[92vw] overflow-hidden rounded-[40px] border-[3px] border-[#7ee8ff] bg-[#07070f] shadow-[0_0_60px_rgba(126,232,255,0.4),0_0_100px_rgba(255,47,185,0.3)]"
            >
              {/* Phone Dynamic Island / Header */}
              <div className="relative z-20 flex flex-col gap-1.5 bg-[#0a0a14] px-4 pt-3 pb-2 border-b border-white/10">
                <div className="mx-auto h-4 w-24 rounded-full bg-black border border-white/10 flex items-center justify-end px-2">
                  <span className="h-2 w-2 rounded-full bg-[#1a2a3a] ring-1 ring-[#7ee8ff]/40" />
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-mono text-white/80 flex-1 truncate">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                    <span className="truncate text-[#7ee8ff]">
                      {activePreview === "resapori" ? "resapori.com" : "mariojuice.com"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsIframeLoaded(false);
                        setIframeKey((k) => k + 1);
                      }}
                      className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-[#7ee8ff]"
                    >
                      <RotateCw className="h-3 w-3" />
                    </button>
                    <a
                      href={activePreview === "resapori" ? RESAPORI_URL : MARIO_JUICE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-[#ff2fb9]"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setActivePreview(null)}
                      className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-[#ff2fb9]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Phone Viewport Iframe */}
              <div className="relative flex-1 w-full overflow-hidden bg-black">
                {!isIframeLoaded && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#08080f] text-center p-6">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7ee8ff] border-t-transparent shadow-[0_0_15px_#7ee8ff]" />
                    <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#7ee8ff]">
                      Loading {activePreview === "resapori" ? "Re Sapori" : "Mario Juice"}...
                    </p>
                  </div>
                )}
                <iframe
                  key={iframeKey}
                  src={activePreview === "resapori" ? RESAPORI_URL : MARIO_JUICE_URL}
                  title="Mobile View"
                  className="h-full w-full border-0 bg-black"
                  onLoad={() => setIsIframeLoaded(true)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                />
              </div>

              {/* Bottom Home Indicator */}
              <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 z-20 h-1 w-28 rounded-full bg-white/50" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

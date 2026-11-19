"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, RotateCw, Smartphone, X } from "lucide-react";

const RESAPORI_URL = "https://resapori.com";

const SHARD_ANGLES = [-150, -105, -55, -20, 25, 70, 120, 165];

export default function ResaporiPhoneTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    // Prevent accidental hover-opening while scrolling down
    const sy = typeof window !== "undefined" ? window.scrollY || document.documentElement.scrollTop || 0 : 0;
    if (sy > 30) return;
    clearTimer();
    setHasOpenedOnce(true);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isPinned) return;
    clearTimer();
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 240);
  };

  // Close instantly when scrolling down and fade out
  useEffect(() => {
    const onScroll = () => {
      const sy = window.scrollY || document.documentElement.scrollTop || 0;
      if (sy > 25) {
        setIsOpen(false);
        setIsPinned(false);
      }
      const op = Math.max(0, Math.min(1, 1 - sy / 300));
      setScrollOpacity(op);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimer();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (scrollOpacity <= 0) return null;

  return (
    <div
      style={{ opacity: scrollOpacity }}
      className="absolute left-4 sm:left-8 lg:left-12 top-[50vh] -translate-y-1/2 z-30 transition-opacity duration-200"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Neon Break Shockwave & Shards when expanding */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="break-burst"
            initial={{ opacity: 0.95, scale: 0.85 }}
            animate={{ opacity: 0, scale: 1.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-32 w-32 rounded-3xl border-2 border-[#ff2fb9] shadow-[0_0_30px_#7ee8ff,0_0_50px_#ff2fb9]"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen &&
          SHARD_ANGLES.map((deg, idx) => {
            const rad = (deg * Math.PI) / 180;
            const dist = 70 + (idx % 3) * 24;
            return (
              <motion.span
                key={`shard-${deg}`}
                initial={{ opacity: 1, x: 48, y: 0, scale: 1, rotate: 0 }}
                animate={{
                  opacity: 0,
                  x: 48 + Math.cos(rad) * dist,
                  y: Math.sin(rad) * dist,
                  scale: 0.2,
                  rotate: deg * 1.4,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.52, ease: "easeOut" }}
                className={`pointer-events-none absolute left-0 top-1/2 h-2 w-2 rounded-sm ${
                  idx % 2 === 0
                    ? "bg-[#7ee8ff] shadow-[0_0_10px_#7ee8ff]"
                    : "bg-[#ff2fb9] shadow-[0_0_10px_#ff2fb9]"
                }`}
              />
            );
          })}
      </AnimatePresence>

      {/* Single Morphing Container: Breaks & Expands from Button -> Phone */}
      <motion.div
        layout
        initial={false}
        animate={{
          width: isOpen ? 340 : 124,
          height: isOpen ? 610 : 124,
          borderRadius: isOpen ? 40 : 22,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 25,
          mass: 0.9,
        }}
        onClick={() => {
          if (!isOpen) {
            setHasOpenedOnce(true);
            setIsOpen(true);
            setIsPinned(true);
          }
        }}
        style={{ maxHeight: "84vh", maxWidth: "88vw" }}
        className={`relative overflow-hidden backdrop-blur-xl transition-shadow duration-300 ${
          isOpen
            ? "border-[3px] border-[#7ee8ff]/85 bg-[#07070c] p-2.5 shadow-[0_0_45px_rgba(126,232,255,0.45),0_0_85px_rgba(255,47,185,0.35),inset_0_0_20px_rgba(126,232,255,0.2)]"
            : "cursor-pointer border border-[#7ee8ff]/80 bg-black/85 shadow-[0_0_25px_rgba(126,232,255,0.45),0_0_50px_rgba(255,47,185,0.25),inset_0_0_18px_rgba(126,232,255,0.2)] hover:border-[#7ee8ff] hover:scale-105 active:scale-95"
        }`}
      >
        {/* Collapsed Button Face */}
        <motion.div
          initial={false}
          animate={{
            opacity: isOpen ? 0 : 1,
            scale: isOpen ? 1.45 : 1,
          }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={`absolute inset-0 flex flex-col items-center justify-center gap-2 px-2 py-2 select-none ${
            isOpen ? "pointer-events-none" : "pointer-events-auto"
          }`}
        >
          <span className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#7ee8ff]/70 bg-gradient-to-br from-[#7ee8ff]/20 to-[#ff2fb9]/25 text-[#7ee8ff] shadow-[0_0_18px_rgba(126,232,255,0.6)]">
            <Smartphone className="h-5 w-5 drop-shadow-[0_0_8px_rgba(126,232,255,0.9)]" />
            <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff2fb9] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#7ee8ff] shadow-[0_0_8px_#7ee8ff]" />
            </span>
          </span>

          <div className="flex flex-col items-center text-center leading-tight">
            <span className="text-[10.5px] font-extrabold uppercase tracking-[0.2em] text-[#7ee8ff] drop-shadow-[0_0_10px_rgba(126,232,255,0.85)]">
              Re Sapori
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#ff2fb9] drop-shadow-[0_0_10px_rgba(255,47,185,0.85)]">
              Website
            </span>
          </div>
        </motion.div>

        {/* Expanded Phone Content */}
        <motion.div
          initial={false}
          animate={{
            opacity: isOpen ? 1 : 0,
            scale: isOpen ? 1 : 0.88,
          }}
          transition={{
            duration: 0.28,
            delay: isOpen ? 0.08 : 0,
            ease: "easeOut",
          }}
          className={`flex h-full w-full flex-col overflow-hidden rounded-[30px] ${
            isOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {/* Phone Top Bezel & Dynamic Island Notch */}
          <div className="relative z-20 flex flex-col gap-1.5 rounded-t-[30px] bg-[#0b0b14] px-3 pt-2 pb-2 border-b border-white/10">
            <div className="mx-auto h-4 w-24 rounded-full bg-black border border-white/10 flex items-center justify-end px-2">
              <span className="h-2 w-2 rounded-full bg-[#1a2a3a] ring-1 ring-[#7ee8ff]/40" />
            </div>

            <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
              <div className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] font-mono text-white/80 flex-1 truncate">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                <span className="truncate text-[#7ee8ff]">resapori.com</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLoaded(false);
                    setIframeKey((k) => k + 1);
                  }}
                  title="Reload preview"
                  className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
                <a
                  href={RESAPORI_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Open site in new tab"
                  className="rounded-full p-1 text-[#7ee8ff] hover:bg-[#7ee8ff]/10 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPinned(false);
                    setIsOpen(false);
                  }}
                  title="Close phone"
                  className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-[#ff2fb9] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Phone Screen: Live Iframe Preview */}
          <div className="relative flex-1 bg-black">
            {!isLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#08080f] text-center">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#7ee8ff] border-t-transparent" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">
                  Connecting to resapori.com...
                </span>
              </div>
            )}

            {hasOpenedOnce && (
              <iframe
                key={iframeKey}
                src={RESAPORI_URL}
                title="Re-Sapori Live Mobile Preview"
                loading="eager"
                onLoad={() => setIsLoaded(true)}
                className="h-full w-full border-0 bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            )}
          </div>

          {/* Phone Bottom Home Bar */}
          <div className="relative z-20 flex items-center justify-center bg-[#0b0b14] py-1.5 border-t border-white/5">
            <span className="h-1 w-28 rounded-full bg-white/40" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

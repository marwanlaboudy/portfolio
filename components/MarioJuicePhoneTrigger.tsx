"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, RotateCw, Smartphone, X } from "lucide-react";

const MARIO_JUICE_URL = "https://mariojuice.com";

const SHARD_ANGLES = [-165, -120, -70, -25, 20, 55, 105, 150];

export default function MarioJuicePhoneTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Listen for gaze direction looking at Mario Juice
  useEffect(() => {
    const handleGaze = () => {
      if (!isOpen && !showConfirm) {
        setShowConfirm(true);
      }
    };
    window.addEventListener("gazeAtMarioJuice", handleGaze);
    return () => window.removeEventListener("gazeAtMarioJuice", handleGaze);
  }, [isOpen, showConfirm]);

  // Close instantly when scrolling down and fade out
  useEffect(() => {
    const onScroll = () => {
      const sy = window.scrollY || document.documentElement.scrollTop || 0;
      if (sy > 25) {
        setIsOpen(false);
        setShowConfirm(false);
      }
      const op = Math.max(0, Math.min(1, 1 - sy / 300));
      setScrollOpacity(op);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (scrollOpacity <= 0) return null;

  return (
    <>
      <div
        style={{ opacity: scrollOpacity }}
        className="absolute left-1/2 -translate-x-1/2 bottom-[11vh] sm:bottom-auto sm:top-[50vh] sm:right-8 lg:right-12 sm:left-auto sm:translate-x-0 -translate-y-1/2 z-30 transition-opacity duration-200"
      >
        {/* Neon Break Shockwave & Shards when expanding */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="break-burst-right"
              initial={{ opacity: 0.95, scale: 0.85 }}
              animate={{ opacity: 0, scale: 1.55 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-32 w-32 rounded-3xl border-2 border-[#7ee8ff] shadow-[0_0_30px_#ff2fb9,0_0_50px_#7ee8ff]"
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
                  key={`shard-right-${deg}`}
                  initial={{ opacity: 1, x: -48, y: 0, scale: 1, rotate: 0 }}
                  animate={{
                    opacity: 0,
                    x: -48 + Math.cos(rad) * dist,
                    y: Math.sin(rad) * dist,
                    scale: 0.2,
                    rotate: deg * 1.4,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.52, ease: "easeOut" }}
                  className={`pointer-events-none absolute right-0 top-1/2 h-2 w-2 rounded-sm ${
                    idx % 2 === 0
                      ? "bg-[#ff2fb9] shadow-[0_0_10px_#ff2fb9]"
                      : "bg-[#7ee8ff] shadow-[0_0_10px_#7ee8ff]"
                  }`}
                />
              );
            })}
        </AnimatePresence>

        {/* Morphing Container: Logo badge on mobile (Down), classic 124px square with logo on laptop */}
        {!isOpen ? (
          isMobile ? (
            /* Sleek circular logo badge on mobile (Down) */
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              onMouseEnter={() => setShowConfirm(true)}
              className="group relative flex items-center gap-2 rounded-full border border-[#ff2fb9]/80 bg-black/90 p-1.5 pr-3.5 backdrop-blur-md shadow-[0_0_20px_rgba(255,47,185,0.4)] active:scale-95 transition-all select-none"
              title="Mario Juice Website"
            >
              <div className="relative h-8 w-8 overflow-hidden rounded-full border border-[#ff2fb9]/70 bg-black shadow-[0_0_8px_#ff2fb9]">
                <img
                  src="/images/mario-juice-logo.jpg"
                  alt="Mario Juice Logo"
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#ff2fb9]">
                  Mario Juice
                </span>
                <span className="text-[7.5px] font-mono tracking-widest text-[#7ee8ff] uppercase">
                  Website
                </span>
              </div>
            </button>
          ) : (
            /* Classic 124px square button on laptop with official logo */
            <div
              onClick={() => setShowConfirm(true)}
              onMouseEnter={() => setShowConfirm(true)}
              style={{ width: 124, height: 124, borderRadius: 22 }}
              className="relative cursor-pointer overflow-hidden backdrop-blur-xl border border-[#ff2fb9]/80 bg-black/85 shadow-[0_0_25px_rgba(255,47,185,0.45),0_0_50px_rgba(126,232,255,0.25),inset_0_0_18px_rgba(255,47,185,0.2)] hover:border-[#ff2fb9] hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2 select-none">
                <div className="relative h-14 w-14 overflow-hidden rounded-full border border-[#ff2fb9]/70 bg-black shadow-[0_0_15px_rgba(255,47,185,0.5)]">
                  <img
                    src="/images/mario-juice-logo.jpg"
                    alt="Mario Juice"
                    className="h-full w-full object-cover object-top"
                  />
                  <span className="absolute -left-0.5 -top-0.5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7ee8ff] opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#ff2fb9] shadow-[0_0_8px_#ff2fb9]" />
                  </span>
                </div>

                <div className="flex flex-col items-center text-center leading-tight">
                  <span className="text-[10.5px] font-extrabold uppercase tracking-[0.2em] text-[#ff2fb9] drop-shadow-[0_0_10px_rgba(255,47,185,0.85)]">
                    Mario Juice
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#7ee8ff] drop-shadow-[0_0_10px_rgba(126,232,255,0.85)]">
                    Website
                  </span>
                </div>
              </div>
            </div>
          )
        ) : (
          /* Expanded Phone View when confirmed */
          <motion.div
            layout
            initial={false}
            animate={{
              width: isMobile ? Math.min(320, typeof window !== "undefined" ? window.innerWidth - 24 : 320) : 340,
              height: isMobile ? Math.min(570, typeof window !== "undefined" ? window.innerHeight - 100 : 570) : 610,
              borderRadius: isMobile ? 32 : 40,
            }}
            transition={{ type: "spring", stiffness: 260, damping: 25, mass: 0.9 }}
            style={{ maxHeight: "84vh", maxWidth: "88vw" }}
            className="relative overflow-hidden backdrop-blur-xl border-[3px] border-[#ff2fb9]/85 bg-[#07070c] p-2.5 shadow-[0_0_45px_rgba(255,47,185,0.45),0_0_85px_rgba(126,232,255,0.35),inset_0_0_20px_rgba(255,47,185,0.2)]"
          >
            <div className="flex h-full w-full flex-col overflow-hidden rounded-[30px]">
              {/* Phone Top Bezel & Dynamic Island Notch */}
              <div className="relative z-20 flex flex-col gap-1.5 rounded-t-[30px] bg-[#0b0b14] px-3 pt-2 pb-2 border-b border-white/10">
                <div className="mx-auto h-4 w-24 rounded-full bg-black border border-white/10 flex items-center justify-end px-2">
                  <span className="h-2 w-2 rounded-full bg-[#2a1a2a] ring-1 ring-[#ff2fb9]/40" />
                </div>

                <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
                  <div className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] font-mono text-white/80 flex-1 truncate">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                    <span className="truncate text-[#ff2fb9]">mariojuice.com</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoaded(false);
                        setIframeKey((k) => k + 1);
                      }}
                      className="rounded-lg p-1 text-white/60 hover:text-white transition-colors"
                      title="Reload website"
                    >
                      <RotateCw className="h-3 w-3" />
                    </button>
                    <a
                      href={MARIO_JUICE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-1 text-white/60 hover:text-[#ff2fb9] transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-lg p-1 text-white/60 hover:text-[#7ee8ff] transition-colors"
                      title="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Web Content Frame */}
              <div className="relative flex-1 w-full bg-white overflow-hidden">
                {!isLoaded && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#07070a] gap-2">
                    <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#ff2fb9] border-t-transparent" />
                    <span className="text-[11px] font-mono tracking-wider text-[#ff2fb9]/70 uppercase">
                      Loading Mario Juice...
                    </span>
                  </div>
                )}
                {hasOpenedOnce && (
                  <iframe
                    key={iframeKey}
                    src={MARIO_JUICE_URL}
                    title="Mario Juice Website"
                    className="h-full w-full border-0"
                    onLoad={() => setIsLoaded(true)}
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Confirmation Dialog: "just asks me if i want to open it" */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="relative max-w-sm w-full rounded-2xl border border-[#ff2fb9]/50 bg-[#090910] p-5 shadow-[0_0_40px_rgba(255,47,185,0.35)] text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#ff2fb9]/70 bg-black shadow-[0_0_15px_rgba(255,47,185,0.5)]">
                  <img
                    src="/images/mario-juice-logo.jpg"
                    alt="Mario Juice"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#ff2fb9]">
                    Mario Juice
                  </h3>
                  <p className="text-[11px] font-mono text-white/50">mariojuice.com</p>
                </div>
              </div>

              <p className="text-xs text-white/80 mb-5 leading-relaxed">
                Do you want to open and explore the <strong>Mario Juice</strong> website?
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirm(false);
                    setHasOpenedOnce(true);
                    setIsOpen(true);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#ff2fb9] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#ff52c7] active:scale-95 transition-all shadow-[0_0_15px_rgba(255,47,185,0.4)]"
                >
                  Interactive Phone
                </button>

                <a
                  href={MARIO_JUICE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowConfirm(false)}
                  className="py-2 px-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <span>New Tab</span>
                  <ExternalLink className="h-3 w-3 text-[#ff2fb9]" />
                </a>

                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="py-2 px-3 rounded-xl border border-white/10 text-white/60 hover:text-white text-xs active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

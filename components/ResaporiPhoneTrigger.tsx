"use client";

import React, { useState, useRef, useEffect } from "react";
import { ExternalLink, RotateCw, Smartphone, X } from "lucide-react";

const RESAPORI_URL = "https://resapori.com";

export default function ResaporiPhoneTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearTimer();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (isPinned) return;
    clearTimer();
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 260);
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  return (
    <div
      className="fixed left-4 sm:left-8 lg:left-12 top-1/2 -translate-y-1/2 z-30 flex items-center gap-4"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glowy Neon Icon / Trigger Pill */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setIsPinned((prev) => !prev);
        }}
        className="group relative flex flex-col items-center gap-2.5 rounded-2xl border border-[#7ee8ff]/80 bg-black/80 px-4 py-4 text-left backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-[#ff2fb9] shadow-[0_0_25px_rgba(126,232,255,0.55),0_0_55px_rgba(255,47,185,0.35),inset_0_0_18px_rgba(126,232,255,0.25)]"
      >
        {/* Outer pulsing neon halo */}
        <span className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#7ee8ff]/35 via-[#ff2fb9]/35 to-[#7ee8ff]/35 blur-md opacity-80 group-hover:opacity-100 transition-opacity" />

        {/* Glowing Icon Box */}
        <span className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-[#7ee8ff]/70 bg-gradient-to-br from-[#7ee8ff]/20 to-[#ff2fb9]/25 text-[#7ee8ff] shadow-[0_0_20px_rgba(126,232,255,0.6)] group-hover:text-[#ff2fb9] group-hover:border-[#ff2fb9] transition-colors">
          <Smartphone className="h-6 w-6 drop-shadow-[0_0_8px_rgba(126,232,255,0.9)]" />
          <span className="absolute -right-1 -top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff2fb9] opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[#7ee8ff] shadow-[0_0_8px_#7ee8ff]" />
          </span>
        </span>

        {/* Neon Label */}
        <div className="relative flex flex-col items-center text-center">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#7ee8ff] drop-shadow-[0_0_10px_rgba(126,232,255,0.85)] group-hover:text-white transition-colors">
            Re Sapori
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#ff2fb9] drop-shadow-[0_0_10px_rgba(255,47,185,0.85)]">
            Website
          </span>
        </div>
      </button>

      {/* Interactive Phone-Sized Website Tab */}
      <div
        className={`origin-left transition-all duration-300 ease-out ${
          isOpen
            ? "pointer-events-auto scale-100 opacity-100 translate-x-0"
            : "pointer-events-none scale-90 opacity-0 -translate-x-6 w-0 overflow-hidden"
        }`}
      >
        <div className="relative flex h-[620px] max-h-[82vh] w-[320px] sm:w-[345px] flex-col overflow-hidden rounded-[40px] border-[3px] border-[#7ee8ff]/80 bg-[#07070c] p-2.5 shadow-[0_0_45px_rgba(126,232,255,0.45),0_0_85px_rgba(255,47,185,0.35),inset_0_0_20px_rgba(126,232,255,0.2)]">
          {/* Phone Top Bezel & Dynamic Island Notch */}
          <div className="relative z-20 flex flex-col gap-1.5 rounded-t-[30px] bg-[#0b0b14] px-3 pt-2 pb-2 border-b border-white/10">
            {/* Dynamic Island */}
            <div className="mx-auto h-4 w-24 rounded-full bg-black border border-white/10 flex items-center justify-end px-2">
              <span className="h-2 w-2 rounded-full bg-[#1a2a3a] ring-1 ring-[#7ee8ff]/40" />
            </div>

            {/* Phone Browser Address Bar */}
            <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
              <div className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] font-mono text-white/80 flex-1 truncate">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                <span className="truncate text-[#7ee8ff]">resapori.com</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoaded(false);
                    setIframeKey((k) => k + 1);
                  }}
                  title="Reload preview"
                  className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-[#7ee8ff] transition-colors"
                >
                  <RotateCw className="h-3 w-3" />
                </button>
                <a
                  href={RESAPORI_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in new tab"
                  className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-[#ff2fb9] transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setIsPinned(false);
                    setIsOpen(false);
                  }}
                  title="Close phone preview"
                  className="rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-[#ff2fb9] transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Phone Screen Viewport */}
          <div className="relative flex-1 w-full overflow-hidden bg-black rounded-b-[28px]">
            {!isLoaded && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#08080f] text-center p-6">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7ee8ff] border-t-transparent shadow-[0_0_15px_#7ee8ff]" />
                <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#7ee8ff]">
                  Loading Re Sapori...
                </p>
              </div>
            )}

            <iframe
              key={iframeKey}
              src={RESAPORI_URL}
              title="Re Sapori Mobile Preview"
              className="h-full w-full border-0 bg-black"
              onLoad={() => setIsLoaded(true)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            />
          </div>

          {/* iPhone Bottom Home Bar Indicator */}
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 z-20 h-1 w-28 rounded-full bg-white/50 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
        </div>
      </div>
    </div>
  );
}

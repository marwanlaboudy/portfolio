"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader({ onComplete }: { onComplete?: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("INITIALIZING TELEMETRY");

  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);

  useEffect(() => {
    let isCancelled = false;
    const startTime = Date.now();
    const minDisplayTime = 1400; // Minimum 1.4s for smooth visual signature reveal
    const maxFallbackTime = 4200; // Max 4.2s fallback so slow connections never get blocked

    let totalAssets = 0;
    let loadedAssets = 0;

    const recordProgress = (increment = 1) => {
      if (isCancelled) return;
      loadedAssets += increment;
      if (totalAssets > 0) {
        const raw = Math.round((loadedAssets / totalAssets) * 98);
        targetProgressRef.current = Math.max(targetProgressRef.current, Math.min(98, raw));
      }
    };

    // Smooth counter animation loop
    let animId: number;
    const tick = () => {
      if (progressRef.current < targetProgressRef.current) {
        // Smoothly step toward target
        progressRef.current += Math.max(1, (targetProgressRef.current - progressRef.current) * 0.18);
        const rounded = Math.min(100, Math.round(progressRef.current));
        setProgress(rounded);

        if (rounded < 35) {
          setStatusText("LOADING 3D MESH & NEURAL FRAMES");
        } else if (rounded < 75) {
          setStatusText("CALIBRATING SPATIAL GAZE");
        } else if (rounded < 99) {
          setStatusText("SYNCHRONIZING SYSTEM ARCHIVE");
        } else {
          setStatusText("ALL SYSTEMS NOMINAL");
        }
      }

      if (progressRef.current >= 100) {
        const elapsed = Date.now() - startTime;
        const delayRemaining = Math.max(0, minDisplayTime - elapsed);
        setTimeout(() => {
          if (!isCancelled) {
            setIsVisible(false);
            if (onComplete) onComplete();
          }
        }, delayRemaining + 250);
        return;
      }

      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    // 1. Preload 3D Mask character.glb
    totalAssets += 1;
    fetch("/models/character.glb")
      .then(() => recordProgress(1))
      .catch(() => recordProgress(1));

    // 2. Preload Manifest & Key Gaze Frames
    fetch("/gaze_frames/manifest.json")
      .then((res) => res.json())
      .then((data) => {
        if (isCancelled) return;

        const blinkUrls: string[] = data.blinkFrames || [];
        const frames: Array<{ file: string }> = data.frames || [];

        // Sample critical frames for fast yet thorough preload (all blink + 60 key directional frames)
        const sampleFrames = frames.filter((_, i) => i % 5 === 0);
        const urlsToPreload = [
          data.centerFrame,
          ...blinkUrls,
          ...sampleFrames.map((f) => f.file),
        ].filter(Boolean);

        totalAssets += urlsToPreload.length;

        urlsToPreload.forEach((url) => {
          const img = new Image();
          img.decoding = "async";
          img.src = url;
          img.onload = () => recordProgress(1);
          img.onerror = () => recordProgress(1);
        });
      })
      .catch(() => {
        // Fallback if manifest is missing or network error
        targetProgressRef.current = 100;
      });

    // 3. Fallback timer: ensure preloader finishes smoothly regardless of network speed
    const fallbackTimer = setTimeout(() => {
      targetProgressRef.current = 100;
    }, maxFallbackTime);

    // Initial nudge
    targetProgressRef.current = 15;

    return () => {
      isCancelled = true;
      cancelAnimationFrame(animId);
      clearTimeout(fallbackTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="site-preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.05,
            filter: "blur(12px)",
            transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07070a] px-6 select-none overflow-hidden"
        >
          {/* Subtle Ambient Glow Blobs */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[520px] w-[520px] rounded-full bg-[#22d3ee]/10 blur-[160px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-[#ec4899]/12 blur-[170px]" />
          </div>

          {/* Central Logo & Signature Lockup (Inspired by the reference image) */}
          <div className="relative flex flex-col items-center justify-center max-w-4xl w-full">
            {/* English Base Typography: STEVEN ● COM style */}
            <div className="relative flex items-center justify-center gap-3 sm:gap-6 text-3xl sm:text-6xl md:text-7xl font-black uppercase tracking-[0.16em] sm:tracking-[0.22em] text-white">
              <span className="font-logo-sans text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                MARWAN
              </span>
              <span className="inline-block h-3 w-3 sm:h-5 sm:w-5 rounded-full bg-gradient-to-r from-[#22d3ee] to-[#ec4899] shadow-[0_0_18px_#22d3ee]" />
              <span className="font-logo-sans text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                LABOUDY
              </span>
            </div>

            {/* Slashing Arabic Signature with Moving Liquid Gradient & Brush Slash */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center -rotate-[7deg] sm:-rotate-[9deg] scale-110 sm:scale-130">
              {/* Dynamic Brush Stroke Slash crossing from bottom-left to top-right */}
              <svg
                className="absolute w-[125%] h-[120%] overflow-visible -z-10"
                viewBox="0 0 650 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="slashBrush" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.05" />
                    <stop offset="20%" stopColor="#ec4899" stopOpacity="0.85" />
                    <stop offset="52%" stopColor="#22d3ee" stopOpacity="0.95" />
                    <stop offset="82%" stopColor="#ec4899" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.15" />
                  </linearGradient>
                </defs>
                <path
                  d="M 15 110 Q 180 95 260 70 T 420 52 Q 520 32 640 15"
                  stroke="url(#slashBrush)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_16px_rgba(236,72,153,0.8)]"
                />
              </svg>

              {/* Arabic Signature with Moving Color Gradient */}
              <div
                dir="rtl"
                className="relative px-4 text-4xl sm:text-7xl md:text-8xl font-arabic-signature font-bold tracking-wider animate-flowing-gradient drop-shadow-[0_0_35px_rgba(34,211,238,0.7)]"
              >
                مروان اللبودي
              </div>
            </div>
          </div>

          {/* Telemetry Progress Indicator */}
          <div className="mt-16 sm:mt-24 w-full max-w-xs sm:max-w-md flex flex-col items-center gap-3">
            {/* Glowing neon progress track */}
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10 p-[1px] shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#22d3ee] via-[#ec4899] to-[#38bdf8] transition-all duration-150 ease-out shadow-[0_0_12px_#22d3ee]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Futuristic Telemetry Status Bar */}
            <div className="w-full flex items-center justify-between text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.22em] text-white/60">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22d3ee] animate-pulse shadow-[0_0_6px_#22d3ee]" />
                <span className="truncate max-w-[200px] sm:max-w-none">{statusText}</span>
              </span>
              <span className="font-bold text-[#22d3ee]">{progress}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

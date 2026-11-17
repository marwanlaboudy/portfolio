"use client";

import React from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import FaceLooker from "@/components/FaceLooker";

interface HeroPortraitProps {
  src?: string;
  progress?: MotionValue<number>;
  className?: string;
}

export function HeroPortrait({
  src = "/gaze_frames/frame_0001.webp",
  progress,
  className = "",
}: HeroPortraitProps) {
  // Scroll-driven dissolve transforms (when progress is provided)
  const defaultProgress = useTransform(() => 0);
  const scrollProg = progress || defaultProgress;

  // 1. Backlight intensity surges as you start scrolling, then fades as portrait dissolves
  const backlightOpacity = useTransform(scrollProg, [0, 0.25, 0.6, 0.85], [0.65, 0.95, 0.8, 0]);
  const backlightScale = useTransform(scrollProg, [0, 0.5, 0.85], [1, 1.15, 0.95]);

  // 2. Rim tint and inner glow intensify on scroll down
  const rimTintOpacity = useTransform(scrollProg, [0, 0.2, 0.6, 0.85], [0.75, 0.95, 0.85, 0]);
  const innerGlowOpacity = useTransform(scrollProg, [0, 0.2, 0.6, 0.85], [0.6, 0.85, 0.7, 0]);

  // 3. Bottom obsidian fade rises to dissolve neck/shoulders into #07070a
  const bottomFadeHeight = useTransform(scrollProg, [0, 0.5, 0.85], ["40%", "58%", "80%"]);

  // 4. Overall portrait dissolve into #07070a
  const portraitOpacity = useTransform(scrollProg, [0, 0.2, 0.55, 0.82], [1, 1, 0.65, 0]);
  const portraitScale = useTransform(scrollProg, [0, 0.5, 0.85], [1, 0.96, 0.92]);
  const portraitY = useTransform(scrollProg, [0, 0.85], [0, 35]);

  return (
    <motion.div
      style={{
        opacity: portraitOpacity,
        scale: portraitScale,
        y: portraitY,
        willChange: "transform, opacity",
      }}
      className={`relative flex items-center justify-center w-[320px] sm:w-[420px] lg:w-[480px] h-[400px] sm:h-[500px] lg:h-[560px] select-none pointer-events-none ${className}`}
    >
      {/* 1. AMBIENT DUAL BACKLIGHT (Behind Face: Left Cyan, Right Pink) */}
      <motion.div
        style={{
          opacity: backlightOpacity,
          scale: backlightScale,
        }}
        className="absolute inset-0 -z-10 blur-[75px]"
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "radial-gradient(circle at 26% 45%, rgba(34, 211, 238, 0.75), transparent 55%), radial-gradient(circle at 74% 45%, rgba(236, 72, 153, 0.75), transparent 55%)",
          }}
        />
      </motion.div>

      {/* 2. MASKED PORTRAIT CONTAINER (Dissolves Edges & Bottom) */}
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 68% 72% at 50% 42%, #000 48%, rgba(0,0,0,0.4) 72%, transparent 95%)",
          maskImage:
            "radial-gradient(ellipse 68% 72% at 50% 42%, #000 48%, rgba(0,0,0,0.4) 72%, transparent 95%)",
        }}
      >
        {/* Base Cutout Portrait: Live Gaze-tracking Canvas */}
        <div className="relative w-full h-full flex items-center justify-center">
          <FaceLooker
            size={560}
            className="w-full h-full object-cover object-top contrast-[1.06] brightness-[0.96]"
          />
        </div>

        {/* 3. DIRECTIONAL RIM TINT (Tints Left Skin/Hair Blue & Right Pink) */}
        <motion.div
          style={{ opacity: rimTintOpacity }}
          className="pointer-events-none absolute inset-0 mix-blend-color"
        >
          <div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(34, 211, 238, 0.95) 0%, rgba(34, 211, 238, 0.28) 32%, transparent 50%, rgba(236, 72, 153, 0.28) 68%, rgba(236, 72, 153, 0.95) 100%)",
            }}
          />
        </motion.div>

        {/* 4. SOFT INNER EDGE GLOW (Blends Rim Light Into Dark Background) */}
        <motion.div
          style={{ opacity: innerGlowOpacity }}
          className="pointer-events-none absolute inset-0 mix-blend-screen"
        >
          <div
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(circle at 12% 45%, rgba(34, 211, 238, 0.75), transparent 45%), radial-gradient(circle at 88% 45%, rgba(236, 72, 153, 0.75), transparent 45%)",
            }}
          />
        </motion.div>

        {/* 5. BOTTOM OBSIDIAN FADE (Melts Neck/Shoulders Into #07070a) */}
        <motion.div
          style={{ height: bottomFadeHeight }}
          className="pointer-events-none absolute inset-x-0 bottom-0"
        >
          <div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(to top, #07070a 15%, rgba(7, 7, 10, 0.9) 45%, transparent 100%)",
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default HeroPortrait;

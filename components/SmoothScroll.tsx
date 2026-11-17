"use client";

import React, { useEffect } from "react";

/**
 * Inertial Smooth Scroll Controller
 * Emulates the exact physics of Lenis / smooth momentum scrolling:
 * Intercepts wheel events and applies damped interpolation to document scroll position.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let currentScroll = window.scrollY;
    let targetScroll = window.scrollY;
    let isRunning = false;
    let animationFrameId: number;

    const ease = 0.085; // Damping factor for silky inertial glide

    const updateScroll = () => {
      const diff = targetScroll - currentScroll;
      if (Math.abs(diff) < 0.5) {
        currentScroll = targetScroll;
        window.scrollTo(0, currentScroll);
        isRunning = false;
        return;
      }

      currentScroll += diff * ease;
      window.scrollTo(0, currentScroll);
      animationFrameId = requestAnimationFrame(updateScroll);
    };

    const onWheel = (e: WheelEvent) => {
      // Don't intercept if modifier keys are pressed or inside an iframe
      if (e.ctrlKey || e.metaKey) return;

      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      targetScroll = Math.max(0, Math.min(maxScroll, targetScroll + e.deltaY));

      if (!isRunning) {
        isRunning = true;
        currentScroll = window.scrollY;
        animationFrameId = requestAnimationFrame(updateScroll);
      }
    };

    const onNativeScroll = () => {
      if (!isRunning) {
        targetScroll = window.scrollY;
        currentScroll = window.scrollY;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("scroll", onNativeScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onNativeScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <>{children}</>;
}

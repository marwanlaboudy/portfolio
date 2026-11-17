"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

interface FaceLookerProps {
  src?: string;
  basePath?: string;
  defaultSrc?: string;
  size?: number;
  className?: string;
}

const P_MIN = -15;
const P_MAX = 15;
const STEP = 3;
const FRAME_SIZE = 256;

function quantizeToGrid(val: number): number {
  const raw = P_MIN + ((val + 1) * (P_MAX - P_MIN)) / 2;
  const snapped = Math.round(raw / STEP) * STEP;
  return Math.max(P_MIN, Math.min(P_MAX, snapped));
}

function sanitizeVal(v: number): string {
  return `${v}`.replace("-", "m").replace(".", "p");
}

function getGazeFilename(px: number, py: number): string {
  return `gaze_px${sanitizeVal(px)}_py${sanitizeVal(py)}_${FRAME_SIZE}.webp`;
}

export default function FaceLooker({
  src,
  basePath = "/avatar_frames/",
  defaultSrc = "/avatar_square.jpg",
  size = 320,
  className = "",
}: FaceLookerProps) {
  const fallbackImage = src || defaultSrc;
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ px: 0, py: 0 });
  const [hasFrames, setHasFrames] = useState<boolean | null>(null);
  const [currentFrameUrl, setCurrentFrameUrl] = useState<string>(
    `${basePath}${getGazeFilename(0, 0)}`
  );
  const [loadedFrame, setLoadedFrame] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Check if frames exist in the target folder
  useEffect(() => {
    const testCenterImg = new window.Image();
    const testPath = `${basePath}${getGazeFilename(0, 0)}`;
    testCenterImg.src = testPath;
    testCenterImg.onload = () => {
      setHasFrames(true);
      setLoadedFrame(testPath);
    };
    testCenterImg.onerror = () => {
      setHasFrames(false);
    };
  }, [basePath]);

  // Update gaze based on mouse movement across the screen
  const updateGaze = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Mouse distance from center of the face
      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;

      // Screen sensitivity range
      const maxDistanceX = window.innerWidth / 1.6;
      const maxDistanceY = window.innerHeight / 1.6;

      const normX = Math.max(-1, Math.min(1, deltaX / maxDistanceX));
      const normY = Math.max(-1, Math.min(1, deltaY / maxDistanceY));

      const px = quantizeToGrid(normX);
      const py = quantizeToGrid(normY);

      setCoords({ px, py });

      const newFrameUrl = `${basePath}${getGazeFilename(px, py)}`;
      setCurrentFrameUrl(newFrameUrl);

      // Preload image in memory for zero-lag swapping
      const img = new window.Image();
      img.src = newFrameUrl;
      img.onload = () => {
        setLoadedFrame(newFrameUrl);
      };
    },
    [basePath]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setIsHovering(true);
      updateGaze(e.clientX, e.clientY);
    };

    const onMouseLeave = () => {
      setIsHovering(false);
      setCoords({ px: 0, py: 0 });
      const centerUrl = `${basePath}${getGazeFilename(0, 0)}`;
      setCurrentFrameUrl(centerUrl);
      setLoadedFrame(centerUrl);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [updateGaze, basePath]);

  // Subtle 3D tilt calculation
  const tiltX = -(coords.py / 15) * 8;
  const tiltY = (coords.px / 15) * 10;
  const glareX = 50 + (coords.px / 15) * 35;
  const glareY = 50 + (coords.py / 15) * 35;

  return (
    <div
      ref={containerRef}
      className={`relative inline-block select-none ${className}`}
      style={{
        width: size,
        height: size,
        perspective: "1000px",
      }}
    >
      {/* Outer Glow Halo */}
      <div
        className="absolute -inset-4 rounded-full opacity-40 blur-2xl transition-all duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(196, 154, 108, 0.45), rgba(34, 51, 74, 0.2), transparent 70%)`,
        }}
      />

      {/* Main Container */}
      <div
        className="w-full h-full rounded-2xl overflow-hidden border border-[#22334A] bg-[#0B1220] shadow-[0_12px_40px_rgba(0,0,0,0.6)] transition-transform ease-out duration-100 relative"
        style={{
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* If 121 Frames are generated and available */}
        {hasFrames ? (
          <img
            src={loadedFrame || currentFrameUrl}
            alt="Interactive Gaze Portrait"
            className="w-full h-full object-cover select-none pointer-events-none"
            style={{
              imageRendering: "auto",
            }}
          />
        ) : (
          /* Fallback while waiting for generation */
          <div className="relative w-full h-full">
            <Image
              src={fallbackImage}
              alt="Portrait"
              fill
              priority
              sizes={`${size}px`}
              className="object-cover pointer-events-none"
            />
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.15) 0%, transparent 60%)`,
              }}
            />
          </div>
        )}

        {/* Live Coordinate Status Badge */}
        <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-between text-[10px] text-white/90 font-mono pointer-events-none">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                hasFrames
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  : isHovering
                  ? "bg-amber-400 animate-pulse"
                  : "bg-neutral-500"
              }`}
            />
            {hasFrames ? "121 Frames Active" : "Generating Frames..."}
          </span>
          <span>
            px: {coords.px} | py: {coords.py}
          </span>
        </div>
      </div>
    </div>
  );
}

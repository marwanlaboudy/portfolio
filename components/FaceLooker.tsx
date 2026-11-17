"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

interface FaceLookerProps {
  /**
   * Base image path to display when idle or as fallback
   */
  src?: string;
  /**
   * Optional sprite sheet path (e.g. '/avatar_sprite.webp')
   */
  spriteSrc?: string;
  /**
   * Number of grid columns and rows (e.g. 11 for an 11x11 = 121 frame grid)
   */
  gridCols?: number;
  gridRows?: number;
  /**
   * Width & height in pixels
   */
  size?: number;
  className?: string;
}

export default function FaceLooker({
  src = "/avatar_square.jpg",
  spriteSrc,
  gridCols = 11,
  gridRows = 11,
  size = 280,
  className = "",
}: FaceLookerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 }); // Normalized -1 to 1
  const [gridPos, setGridPos] = useState({
    col: Math.floor(gridCols / 2),
    row: Math.floor(gridRows / 2),
  });
  const [isHovering, setIsHovering] = useState(false);
  const [hasFrames, setHasFrames] = useState(false);
  const [frameIndex, setFrameIndex] = useState(Math.floor((gridCols * gridRows) / 2));

  // Check if avatar_frames folder has frames or if spriteSrc is active
  useEffect(() => {
    if (spriteSrc) {
      setHasFrames(true);
      return;
    }
    // Probe if individual frames exist
    const testImg = new window.Image();
    testImg.src = `/avatar_frames/frame_0_0.jpg`;
    testImg.onload = () => setHasFrames(true);
    testImg.onerror = () => setHasFrames(false);
  }, [spriteSrc]);

  // Handle mouse movement across the entire viewport
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const faceCenterX = rect.left + rect.width / 2;
      const faceCenterY = rect.top + rect.height / 2;

      // Distance from mouse to center of the face
      const deltaX = e.clientX - faceCenterX;
      const deltaY = e.clientY - faceCenterY;

      // Max reach across the window
      const maxDistanceX = window.innerWidth / 1.5;
      const maxDistanceY = window.innerHeight / 1.5;

      const normX = Math.max(-1, Math.min(1, deltaX / maxDistanceX));
      const normY = Math.max(-1, Math.min(1, deltaY / maxDistanceY));

      setCoords({ x: normX, y: normY });

      // Calculate grid indices (0 to gridCols - 1)
      const col = Math.max(0, Math.min(gridCols - 1, Math.round(((normX + 1) / 2) * (gridCols - 1))));
      const row = Math.max(0, Math.min(gridRows - 1, Math.round(((normY + 1) / 2) * (gridRows - 1))));

      setGridPos({ col, row });
      setFrameIndex(row * gridCols + col);
    },
    [gridCols, gridRows]
  );

  // Return to center when mouse leaves window
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setCoords({ x: 0, y: 0 });
    setGridPos({
      col: Math.floor(gridCols / 2),
      row: Math.floor(gridRows / 2),
    });
    setFrameIndex(Math.floor((gridCols * gridRows) / 2));
  }, [gridCols, gridRows]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setIsHovering(true);
      handleMouseMove(e);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  // CSS 3D Tilt angles for fallback/enhanced mode
  const tiltX = -coords.y * 14; // Pitch tilt
  const tiltY = coords.x * 16;  // Yaw rotation
  const glareX = 50 + coords.x * 30;
  const glareY = 50 + coords.y * 30;

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

      {/* Main Container with 3D Perspective */}
      <div
        className="w-full h-full rounded-2xl overflow-hidden border border-[#22334A] bg-[#0B1220] shadow-[0_12px_40px_rgba(0,0,0,0.6)] transition-transform ease-out duration-150 relative"
        style={{
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* If Sprite Sheet is configured */}
        {spriteSrc ? (
          <div
            className="w-full h-full bg-no-repeat"
            style={{
              backgroundImage: `url(${spriteSrc})`,
              backgroundSize: `${gridCols * 100}% ${gridRows * 100}%`,
              backgroundPosition: `${(gridPos.col / (gridCols - 1)) * 100}% ${(gridPos.row / (gridRows - 1)) * 100}%`,
            }}
          />
        ) : hasFrames ? (
          /* If Individual 121 Frames are present in /avatar_frames/frame_{row}_{col}.jpg */
          <img
            src={`/avatar_frames/frame_${gridPos.row}_${gridPos.col}.jpg`}
            alt="Interactive Portrait"
            className="w-full h-full object-cover"
          />
        ) : (
          /* Standard High-Quality Base Image with Real-time 3D Head Tracking */
          <div className="relative w-full h-full">
            <Image
              src={src}
              alt="Interactive Portrait"
              fill
              priority
              sizes={`${size}px`}
              className="object-cover transition-transform duration-100 ease-out"
              style={{
                transform: `scale(1.08) translate(${coords.x * 6}px, ${coords.y * 6}px)`,
              }}
            />

            {/* Subtle dynamic sheen reflection over the portrait */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.12) 0%, transparent 60%)`,
              }}
            />
          </div>
        )}

        {/* Live Coordinate Badge (Hover/Debug indicator) */}
        <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between text-[10px] text-white/80 font-mono pointer-events-none">
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isHovering ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"}`} />
            {hasFrames || spriteSrc ? "121-Frame Mode" : "Interactive Head Track"}
          </span>
          <span>
            Col: {gridPos.col} | Row: {gridPos.row}
          </span>
        </div>
      </div>
    </div>
  );
}

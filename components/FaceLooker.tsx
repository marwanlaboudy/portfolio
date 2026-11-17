"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface GazeFrame {
  id: number;
  file: string;
  x: number;
  y: number;
}

interface ManifestData {
  total: number;
  centerFrame: string;
  frames: GazeFrame[];
}

interface FaceLookerProps {
  src?: string;
  manifestUrl?: string;
  size?: number;
  className?: string;
}

export default function FaceLooker({
  manifestUrl = "/gaze_frames/manifest.json",
  size = 320,
  className = "",
}: FaceLookerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [manifest, setManifest] = useState<ManifestData | null>(null);
  const [activeFrameId, setActiveFrameId] = useState<number>(0);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [loadedCount, setLoadedCount] = useState<number>(0);

  // References for animation loop & preloaded images
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const smoothCoordRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isInteractingRef = useRef<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);
  const currentRenderedIdRef = useRef<number | null>(null);

  // 1. Fetch manifest.json
  useEffect(() => {
    fetch(manifestUrl)
      .then((res) => res.json())
      .then((data: ManifestData) => {
        setManifest(data);
        // Preload all frames for instant 60fps frame swapping
        let loaded = 0;
        data.frames.forEach((f) => {
          const img = new Image();
          img.src = f.file;
          img.onload = () => {
            loaded += 1;
            setLoadedCount(loaded);
            // Draw center frame initially
            if (f.file === data.centerFrame && canvasRef.current) {
              const ctx = canvasRef.current.getContext("2d");
              if (ctx) {
                ctx.drawImage(img, 0, 0, size, size);
              }
              setActiveFrameId(f.id);
            }
          };
          imagesRef.current.set(f.id, img);
        });
      })
      .catch((err) => console.error("Could not load gaze manifest:", err));
  }, [manifestUrl, size]);

  // 2. Render Loop with Smooth Spring/Lerp
  const renderFrame = useCallback(() => {
    if (!manifest || manifest.frames.length === 0) return;

    // Smoothly interpolate towards mouse target
    const lerpFactor = 0.28;
    smoothCoordRef.current.x +=
      (mouseTargetRef.current.x - smoothCoordRef.current.x) * lerpFactor;
    smoothCoordRef.current.y +=
      (mouseTargetRef.current.y - smoothCoordRef.current.y) * lerpFactor;

    const sx = smoothCoordRef.current.x;
    const sy = smoothCoordRef.current.y;

    // Find nearest neighbor frame
    let bestDist = Infinity;
    let bestFrame = manifest.frames[0];

    for (let i = 0; i < manifest.frames.length; i++) {
      const f = manifest.frames[i];
      const dx = f.x - sx;
      const dy = f.y - sy;
      const d = dx * dx + dy * dy;
      if (d < bestDist) {
        bestDist = d;
        bestFrame = f;
      }
    }

    if (bestFrame.id !== currentRenderedIdRef.current) {
      currentRenderedIdRef.current = bestFrame.id;
      setActiveFrameId(bestFrame.id);

      const img = imagesRef.current.get(bestFrame.id);
      if (img && img.complete && canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, size, size);
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(renderFrame);
  }, [manifest, size]);

  // Start / stop render loop
  useEffect(() => {
    animFrameIdRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [renderFrame]);

  // 3. Mouse Movement tracking across the entire screen
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      isInteractingRef.current = true;

      const rect = containerRef.current.getBoundingClientRect();
      const faceCenterX = rect.left + rect.width / 2;
      const faceCenterY = rect.top + rect.height / 2;

      const deltaX = e.clientX - faceCenterX;
      const deltaY = e.clientY - faceCenterY;

      // Screen sensitivity bounds
      const maxDistanceX = window.innerWidth / 1.7;
      const maxDistanceY = window.innerHeight / 1.7;

      const normX = Math.max(-1, Math.min(1, deltaX / maxDistanceX));
      const normY = Math.max(-1, Math.min(1, deltaY / maxDistanceY));

      mouseTargetRef.current = { x: normX, y: normY };
      setCoords({ x: normX, y: normY });
    };

    const onMouseLeave = () => {
      isInteractingRef.current = false;
      mouseTargetRef.current = { x: 0, y: 0 };
      setCoords({ x: 0, y: 0 });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  // Subtle 3D card tilt matching cursor position
  const tiltX = -coords.y * 7;
  const tiltY = coords.x * 9;
  const glareX = 50 + coords.x * 35;
  const glareY = 50 + coords.y * 35;

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

      {/* Main Container with subtle 3D tilt */}
      <div
        className="w-full h-full rounded-2xl overflow-hidden border border-[#22334A] bg-[#0B1220] shadow-[0_12px_40px_rgba(0,0,0,0.6)] transition-transform ease-out duration-100 relative"
        style={{
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Hardware-Accelerated Canvas */}
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="w-full h-full object-cover block select-none pointer-events-none"
        />

        {/* Dynamic Light Sheen overlay */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.12) 0%, transparent 60%)`,
          }}
        />

        {/* Status Indicator Badge */}
        <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-between text-[10px] text-white/90 font-mono pointer-events-none">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                manifest && loadedCount > 20
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  : "bg-amber-400 animate-pulse"
              }`}
            />
            {manifest && loadedCount > 20
              ? `${manifest.total} Real Frames Active`
              : "Buffering Frames..."}
          </span>
          <span>
            Frame #{activeFrameId} | ({coords.x.toFixed(2)}, {coords.y.toFixed(2)})
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface GazeFrame {
  id: number;
  seg?: number;
  file: string;
  x: number;
  y: number;
}

interface ManifestData {
  total: number;
  centerFrame: string;
  centerFrameId?: number;
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

  // References for 60fps animation loop & preloaded images
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const smoothCoordRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameIdRef = useRef<number | null>(null);
  const currentFrameRef = useRef<GazeFrame | null>(null);

  // 1. Fetch manifest.json & preload all 589 WebP frames
  useEffect(() => {
    let cancelled = false;
    fetch(manifestUrl, { cache: "no-store" })
      .then((res) => res.json())
      .then((data: ManifestData) => {
        if (cancelled) return;
        setManifest(data);

        // Preload center frame first for instant initial render
        const centerEntry =
          data.frames.find((f) => f.file === data.centerFrame) ||
          data.frames[0];

        if (centerEntry) {
          currentFrameRef.current = centerEntry;
          setActiveFrameId(centerEntry.id);
        }

        let loaded = 0;
        data.frames.forEach((f) => {
          const img = new window.Image();
          img.decoding = "async";
          img.src = f.file;
          img.onload = () => {
            if (cancelled) return;
            loaded += 1;
            setLoadedCount(loaded);
            if (f.file === data.centerFrame && canvasRef.current) {
              const ctx = canvasRef.current.getContext("2d");
              if (ctx) {
                ctx.globalAlpha = 1.0;
                ctx.drawImage(img, 0, 0, size, size);
              }
            }
          };
          imagesRef.current.set(f.id, img);
        });
      })
      .catch((err) => console.error("Could not load gaze manifest:", err));

    return () => {
      cancelled = true;
    };
  }, [manifestUrl, size]);

  // 2. 60fps Render Loop with Spring Smoothing & Segment Continuity
  const renderFrame = useCallback(() => {
    if (!manifest || manifest.frames.length === 0) return;

    // Responsive smooth interpolation toward cursor target
    const lerpFactor = 0.24;
    smoothCoordRef.current.x +=
      (mouseTargetRef.current.x - smoothCoordRef.current.x) * lerpFactor;
    smoothCoordRef.current.y +=
      (mouseTargetRef.current.y - smoothCoordRef.current.y) * lerpFactor;

    const sx = smoothCoordRef.current.x;
    const sy = smoothCoordRef.current.y;

    const curFrame = currentFrameRef.current;
    const curSeg = curFrame?.seg ?? -1;
    const curId = curFrame?.id ?? -1;

    let bestScore = Infinity;
    let bestFrame = manifest.frames[0];

    for (let i = 0; i < manifest.frames.length; i++) {
      const f = manifest.frames[i];
      // Only consider frames whose Image has finished loading
      const imgObj = imagesRef.current.get(f.id);
      if (!imgObj || !imgObj.complete || imgObj.naturalWidth === 0) continue;

      const dx = f.x - sx;
      const dy = f.y - sy;
      let score = dx * dx + dy * dy;

      // Temporal & segment hysteresis to prevent boundary jitter
      if (f.seg === curSeg) {
        score += Math.min(0.0018, Math.abs(f.id - curId) * 0.00004);
      } else {
        score += 0.0022;
      }

      if (score < bestScore) {
        bestScore = score;
        bestFrame = f;
      }
    }

    if (bestFrame && bestFrame.id !== curFrame?.id) {
      const nextImg = imagesRef.current.get(bestFrame.id);
      if (nextImg && nextImg.complete && canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          // Cross-blend when jumping across different segments for seamless transitions
          const isSegmentSwitch =
            curFrame && bestFrame.seg !== curFrame.seg && Math.abs(bestFrame.id - curFrame.id) > 3;
          ctx.globalAlpha = isSegmentSwitch ? 0.65 : 1.0;
          ctx.drawImage(nextImg, 0, 0, size, size);
          ctx.globalAlpha = 1.0;
        }
        currentFrameRef.current = bestFrame;
        setActiveFrameId(bestFrame.id);
      }
    } else if (curFrame && canvasRef.current) {
      // Ensure full opacity settles on the target frame
      const curImg = imagesRef.current.get(curFrame.id);
      if (curImg && curImg.complete) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.globalAlpha = 1.0;
          ctx.drawImage(curImg, 0, 0, size, size);
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(renderFrame);
  }, [manifest, size]);

  useEffect(() => {
    animFrameIdRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [renderFrame]);

  // 3. Viewport-Aware Cursor & Touch Tracking
  useEffect(() => {
    const updateFromClientXY = (clientX: number, clientY: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const faceCenterX = rect.left + rect.width / 2;
      const faceCenterY = rect.top + rect.height / 2;

      const deltaX = clientX - faceCenterX;
      const deltaY = clientY - faceCenterY;

      // Normalize asymmetrically based on actual available distance to each edge of the window
      const reachLeft = Math.max(160, faceCenterX * 0.85);
      const reachRight = Math.max(160, (window.innerWidth - faceCenterX) * 0.85);
      const reachUp = Math.max(160, faceCenterY * 0.85);
      const reachDown = Math.max(160, (window.innerHeight - faceCenterY) * 0.85);

      const normX = Math.max(
        -1,
        Math.min(1, deltaX < 0 ? deltaX / reachLeft : deltaX / reachRight)
      );
      const normY = Math.max(
        -1,
        Math.min(1, deltaY < 0 ? deltaY / reachUp : deltaY / reachDown)
      );

      mouseTargetRef.current = { x: normX, y: normY };
      setCoords({ x: normX, y: normY });
    };

    const onMouseMove = (e: MouseEvent) => {
      updateFromClientXY(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateFromClientXY(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onMouseLeave = () => {
      mouseTargetRef.current = { x: 0, y: 0 };
      setCoords({ x: 0, y: 0 });
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("mouseleave", onMouseLeave);
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
                manifest && loadedCount > 50
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  : "bg-amber-400 animate-pulse"
              }`}
            />
            {manifest && loadedCount > 50
              ? `${manifest.total} Smooth Frames`
              : `Loading (${loadedCount}/${manifest?.total ?? 589})...`}
          </span>
          <span>
            #{activeFrameId} | ({coords.x.toFixed(2)}, {coords.y.toFixed(2)})
          </span>
        </div>
      </div>
    </div>
  );
}

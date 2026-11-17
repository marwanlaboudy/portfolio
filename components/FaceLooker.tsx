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
  size = 640,
  className = "",
}: FaceLookerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [manifest, setManifest] = useState<ManifestData | null>(null);

  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const smoothCoordRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameIdRef = useRef<number | null>(null);
  const currentFrameRef = useRef<GazeFrame | null>(null);
  const lastDrawnIdRef = useRef<number | null>(null);

  const drawImageToCanvas = useCallback(
    (img: HTMLImageElement, frameId: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      lastDrawnIdRef.current = frameId;
    },
    [size]
  );

  // 1. Fetch manifest.json & prioritize center frame immediately
  useEffect(() => {
    let cancelled = false;
    fetch(manifestUrl, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("manifest not ready");
        return res.json();
      })
      .then((data: ManifestData) => {
        if (cancelled) return;
        setManifest(data);

        const centerEntry =
          data.frames.find((f) => f.file === data.centerFrame) ||
          data.frames[0];

        if (centerEntry) {
          currentFrameRef.current = centerEntry;
          const centerImg = new window.Image();
          centerImg.decoding = "async";
          centerImg.src = centerEntry.file;
          centerImg.onload = () => {
            if (cancelled) return;
            imagesRef.current.set(centerEntry.id, centerImg);
            if (lastDrawnIdRef.current === null) {
              drawImageToCanvas(centerImg, centerEntry.id);
            }
          };
        }

        // Preload all remaining frames
        data.frames.forEach((f) => {
          if (centerEntry && f.id === centerEntry.id) return;
          const img = new window.Image();
          img.decoding = "async";
          img.src = f.file;
          img.onload = () => {
            if (cancelled) return;
            imagesRef.current.set(f.id, img);
            if (lastDrawnIdRef.current === null) {
              drawImageToCanvas(img, f.id);
            }
          };
        });
      })
      .catch(() => {
        /* manifest not ready */
      });

    return () => {
      cancelled = true;
    };
  }, [manifestUrl, drawImageToCanvas]);

  // 2. 60fps Render Loop with Smooth Interpolation & Continuity
  const renderFrame = useCallback(() => {
    if (manifest && manifest.frames.length > 0) {
      const lerpFactor = 0.22;
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
      let bestFrame: GazeFrame | null = null;

      for (let i = 0; i < manifest.frames.length; i++) {
        const f = manifest.frames[i];
        const imgObj = imagesRef.current.get(f.id);
        if (!imgObj || !imgObj.complete || imgObj.naturalWidth === 0) continue;

        const dx = f.x - sx;
        const dy = f.y - sy;
        let score = dx * dx + dy * dy;

        if (f.seg === curSeg) {
          score += Math.min(0.002, Math.abs(f.id - curId) * 0.00005);
        } else {
          score += 0.003;
        }

        if (score < bestScore) {
          bestScore = score;
          bestFrame = f;
        }
      }

      if (bestFrame && bestFrame.id !== lastDrawnIdRef.current) {
        const nextImg = imagesRef.current.get(bestFrame.id);
        if (nextImg && nextImg.complete) {
          drawImageToCanvas(nextImg, bestFrame.id);
          currentFrameRef.current = bestFrame;
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(renderFrame);
  }, [manifest, drawImageToCanvas]);

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

  return (
    <div
      ref={containerRef}
      className={`relative block select-none ${className}`}
      style={{ width: size, aspectRatio: "1 / 1" }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="block h-full w-full select-none pointer-events-none drop-shadow-[-16px_0_36px_rgba(126,232,255,0.22)] drop-shadow-[16px_0_36px_rgba(255,47,185,0.25)]"
      />
    </div>
  );
}

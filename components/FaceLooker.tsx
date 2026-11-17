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
  blinkFrames?: string[];
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
  const blinkImagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const smoothCoordRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isCursorOnFaceRef = useRef<boolean>(true);
  const animFrameIdRef = useRef<number | null>(null);
  const lastDrawnKeyRef = useRef<string | null>(null);

  const drawImageToCanvas = useCallback(
    (img: HTMLImageElement, key: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      lastDrawnKeyRef.current = key;
    },
    [size]
  );

  // 1. Fetch manifest.json & preload blink loop + gaze frames
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

        // Preload blink frames first so the initial face & blink animation start immediately
        if (data.blinkFrames && data.blinkFrames.length > 0) {
          data.blinkFrames.forEach((url, idx) => {
            const bImg = new window.Image();
            bImg.decoding = "async";
            bImg.src = url;
            bImg.onload = () => {
              if (cancelled) return;
              blinkImagesRef.current.set(idx, bImg);
              if (idx === 0 && lastDrawnKeyRef.current === null) {
                drawImageToCanvas(bImg, `blink_0`);
              }
            };
          });
        }

        const centerEntry =
          data.frames.find((f) => f.file === data.centerFrame) ||
          data.frames[0];

        if (centerEntry) {
          const centerImg = new window.Image();
          centerImg.decoding = "async";
          centerImg.src = centerEntry.file;
          centerImg.onload = () => {
            if (cancelled) return;
            imagesRef.current.set(centerEntry.id, centerImg);
            if (lastDrawnKeyRef.current === null) {
              drawImageToCanvas(centerImg, `gaze_${centerEntry.id}`);
            }
          };
        }

        // Preload all directional gaze frames
        data.frames.forEach((f) => {
          if (centerEntry && f.id === centerEntry.id) return;
          const img = new window.Image();
          img.decoding = "async";
          img.src = f.file;
          img.onload = () => {
            if (cancelled) return;
            imagesRef.current.set(f.id, img);
            if (lastDrawnKeyRef.current === null) {
              drawImageToCanvas(img, `gaze_${f.id}`);
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

  // 2. 60fps Render Loop: plays repeating blink loop when cursor is on the face,
  //    or tracks cursor direction when cursor moves around the screen
  const renderFrame = useCallback(() => {
    if (manifest) {
      const lerpFactor = 0.24;
      smoothCoordRef.current.x +=
        (mouseTargetRef.current.x - smoothCoordRef.current.x) * lerpFactor;
      smoothCoordRef.current.y +=
        (mouseTargetRef.current.y - smoothCoordRef.current.y) * lerpFactor;

      const sx = smoothCoordRef.current.x;
      const sy = smoothCoordRef.current.y;

      const blinkCount = manifest.blinkFrames?.length ?? 0;
      const nearCenter = sx * sx + sy * sy < 0.025;

      if (
        (isCursorOnFaceRef.current || nearCenter) &&
        blinkCount > 0 &&
        blinkImagesRef.current.size > 0
      ) {
        // Loop through blink frames at 24fps
        const blinkIdx = Math.floor(performance.now() / (1000 / 24)) % blinkCount;
        const bImg = blinkImagesRef.current.get(blinkIdx);
        const key = `blink_${blinkIdx}`;
        if (bImg && bImg.complete && bImg.naturalWidth > 0 && lastDrawnKeyRef.current !== key) {
          drawImageToCanvas(bImg, key);
        }
      } else if (manifest.frames.length > 0) {
        let bestScore = Infinity;
        let bestFrame: GazeFrame | null = null;

        for (let i = 0; i < manifest.frames.length; i++) {
          const f = manifest.frames[i];
          const imgObj = imagesRef.current.get(f.id);
          if (!imgObj || !imgObj.complete || imgObj.naturalWidth === 0) continue;

          const dx = f.x - sx;
          const dy = f.y - sy;
          const score = dx * dx + dy * dy;

          if (score < bestScore) {
            bestScore = score;
            bestFrame = f;
          }
        }

        if (bestFrame) {
          const key = `gaze_${bestFrame.id}`;
          if (lastDrawnKeyRef.current !== key) {
            const nextImg = imagesRef.current.get(bestFrame.id);
            if (nextImg && nextImg.complete) {
              drawImageToCanvas(nextImg, key);
            }
          }
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

  // 3. Viewport-Aware Cursor, Touch & Scroll Tracking (detects when cursor is on face & looks down on scroll)
  useEffect(() => {
    const lastClientPos = {
      x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
      y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
    };

    const updateFromClientXY = (clientX: number, clientY: number) => {
      lastClientPos.x = clientX;
      lastClientPos.y = clientY;

      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const faceCenterX = rect.left + rect.width / 2;
      const faceCenterY = rect.top + rect.height / 2;

      const deltaX = clientX - faceCenterX;
      const deltaY = clientY - faceCenterY;

      // Scroll downward tracking: as scroll increases, face tilts down towards the rest of the work
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const scrollRatio = Math.min(1, Math.max(0, scrollY / 360));

      // Check if cursor is within central face area only if not scrolled down
      const faceRadiusX = rect.width * 0.28;
      const faceRadiusY = rect.height * 0.34;
      const normFaceDist =
        (deltaX / faceRadiusX) ** 2 + (deltaY / faceRadiusY) ** 2;

      if (normFaceDist <= 1.0 && scrollRatio < 0.05) {
        isCursorOnFaceRef.current = true;
        mouseTargetRef.current = { x: 0, y: 0 };
        return;
      }

      isCursorOnFaceRef.current = false;

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

      // Blend scroll downward look smoothly:
      // When scrollRatio increases towards 1, target y smoothly approaches +1.0 (looking straight down at work)
      const targetY = normY * (1 - scrollRatio) + 1.0 * scrollRatio;
      const targetX = normX * (1 - scrollRatio * 0.45);

      mouseTargetRef.current = { x: targetX, y: targetY };
    };

    const onMouseMove = (e: MouseEvent) => {
      updateFromClientXY(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateFromClientXY(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onScroll = () => {
      updateFromClientXY(lastClientPos.x, lastClientPos.y);
    };

    const onMouseLeave = (e: MouseEvent) => {
      // If pointer entered an iframe inside the viewport (e.g. the phone preview), keep looking at it
      if (
        e.clientX > 8 &&
        e.clientX < window.innerWidth - 8 &&
        e.clientY > 8 &&
        e.clientY < window.innerHeight - 8
      ) {
        return;
      }
      isCursorOnFaceRef.current = true;
      mouseTargetRef.current = { x: 0, y: 0 };
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("scroll", onScroll);
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

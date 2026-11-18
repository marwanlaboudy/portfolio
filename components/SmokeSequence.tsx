"use client";

import React, { useEffect, useRef } from "react";
import { MotionValue, useMotionValueEvent } from "framer-motion";

const TOTAL = 119;
const frameUrl = (i: number) =>
  `/smoke_frames/smoke_${String(i).padStart(4, "0")}.webp?v=1`;

interface Props {
  /** 0..1 scrub progress of the smoke dissolve */
  progress: MotionValue<number>;
  size?: number;
  className?: string;
}

/**
 * Scroll-scrubbed transparent frame sequence (face -> cyan/magenta smoke).
 * Draws straight to a canvas (no React re-renders) and keeps the last
 * successfully loaded frame on screen so nothing ever flickers.
 */
export default function SmokeSequence({ progress, size = 620, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | undefined)[]>([]);
  const lastDrawn = useRef(-1);
  const wanted = useRef(0);

  const draw = (idx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // nearest loaded frame (search outward) so scrubbing is always seamless
    const imgs = imagesRef.current;
    let use = -1;
    for (let d = 0; d < TOTAL; d++) {
      if (imgs[idx - d]?.complete && imgs[idx - d]!.naturalWidth) { use = idx - d; break; }
      if (imgs[idx + d]?.complete && imgs[idx + d]!.naturalWidth) { use = idx + d; break; }
    }
    if (use < 0 || use === lastDrawn.current) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgs[use]!, 0, 0, canvas.width, canvas.height);
    lastDrawn.current = use;
  };

  useEffect(() => {
    let cancelled = false;
    const imgs: (HTMLImageElement | undefined)[] = new Array(TOTAL);
    imagesRef.current = imgs;

    const load = (i: number) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = frameUrl(i);
      img.onload = () => {
        if (cancelled) return;
        imgs[i] = img;
        if (Math.abs(i - wanted.current) < 3) draw(wanted.current);
      };
    };

    // frame 0 first, then every 4th (coarse scrub works immediately), then the rest
    const order: number[] = [0];
    for (let i = 4; i < TOTAL; i += 4) order.push(i);
    for (let i = 1; i < TOTAL; i++) if (i % 4 !== 0) order.push(i);

    const idle = (cb: () => void) =>
      "requestIdleCallback" in window
        ? (window as any).requestIdleCallback(cb, { timeout: 600 })
        : setTimeout(cb, 40);

    let k = 0;
    const pump = () => {
      if (cancelled || k >= order.length) return;
      for (let n = 0; n < 6 && k < order.length; n++) load(order[k++]);
      idle(pump);
    };
    pump();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(progress, "change", (v) => {
    const idx = Math.max(0, Math.min(TOTAL - 1, Math.round(v * (TOTAL - 1))));
    wanted.current = idx;
    draw(idx);
  });

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={640}
      style={{ width: size, aspectRatio: "1 / 1" }}
      className={`pointer-events-none block select-none ${className}`}
    />
  );
}

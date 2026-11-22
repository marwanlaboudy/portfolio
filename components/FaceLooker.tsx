"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

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
  modelUrl?: string;
  size?: number;
  className?: string;
}

export default function FaceLooker({
  manifestUrl = "/gaze_frames/manifest.json",
  modelUrl = "/models/character.glb",
  size = 640,
  className = "",
}: FaceLookerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);
  const lightningCanvasRef = useRef<HTMLCanvasElement>(null);

  // Scroll-triggered fast double-lighting strobe & disappear-in-place state
  const scrollLightningRef = useRef<{
    armed: boolean;
    started: boolean;
    startTime: number;
    finishedForever: boolean;
    soundPlayed: boolean;
  }>({
    armed: false,
    started: false,
    startTime: 0,
    finishedForever: false,
    soundPlayed: false,
  });

  const scaryAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playScaryFlashSound = useCallback(() => {
    if (scrollLightningRef.current.soundPlayed) return;
    scrollLightningRef.current.soundPlayed = true;

    // 1. Play simple dark double-pulse WAV
    if (scaryAudioRef.current) {
      try {
        scaryAudioRef.current.currentTime = 0;
        scaryAudioRef.current.volume = 0.55;
        const p = scaryAudioRef.current.play();
        if (p && typeof p.catch === "function") {
          p.catch(() => {});
        }
      } catch {
        /* ignore */
      }
    }

    // 2. Simple clean low sub-pulse at 0ms & 210ms
    try {
      const AudioCtx =
        typeof window !== "undefined"
          ? window.AudioContext || (window as any).webkitAudioContext
          : null;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;

      const triggerPulse = (offsetSec: number, peak: number) => {
        const t0 = now + offsetSec;
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = "sine";
        subOsc.frequency.setValueAtTime(76, t0);
        subOsc.frequency.exponentialRampToValueAtTime(34, t0 + 0.14);
        subGain.gain.setValueAtTime(0.001, t0);
        subGain.gain.linearRampToValueAtTime(peak, t0 + 0.008);
        subGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.16);
        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.start(t0);
        subOsc.stop(t0 + 0.17);
      };

      triggerPulse(0, 0.28);
      triggerPulse(0.21, 0.32);
    } catch {
      /* ignore */
    }
  }, []);

  // Preload WAV & unlock audio context on first user interaction
  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new window.Audio("/sounds/scary-flash.wav");
    audio.preload = "auto";
    audio.volume = 0.55;
    scaryAudioRef.current = audio;

    const unlock = () => {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx && !audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
    };

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("keydown", unlock, { passive: true });
    window.addEventListener("wheel", unlock, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("wheel", unlock);
    };
  }, []);

  const [manifest, setManifest] = useState<ManifestData | null>(null);
  const [isGyroActive, setIsGyroActive] = useState<boolean>(false);
  const isGyroActiveRef = useRef<boolean>(false);
  const isGyroCenteredRef = useRef<boolean>(true);
  const camBaselineRef = useRef<{ x: number; y: number; samples: number } | null>(null);
  const smoothCamRef = useRef<{ x: number; y: number } | null>(null);
  const camStreamRef = useRef<MediaStream | null>(null);
  const camVideoRef = useRef<HTMLVideoElement | null>(null);
  const mpDetectorRef = useRef<any>(null);
  const gazeTargetTimerRef = useRef<{ target: string | null; start: number; fired: boolean }>({
    target: null,
    start: 0,
    fired: false,
  });
  const lastScrollTimeRef = useRef<number>(0);
  const activeModalsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleModalState = (e: any) => {
      const site = e.detail?.site;
      const active = e.detail?.active;
      if (!site) return;
      if (active) {
        activeModalsRef.current.add(site);
      } else {
        activeModalsRef.current.delete(site);
      }
    };
    window.addEventListener("websiteModalState", handleModalState);
    return () => window.removeEventListener("websiteModalState", handleModalState);
  }, []);

  const stopCamera = useCallback(() => {
    isGyroActiveRef.current = false;
    setIsGyroActive(false);
    camBaselineRef.current = null;
    smoothCamRef.current = null;
    isGyroCenteredRef.current = true;
    isCursorOnFaceRef.current = true;
    mouseTargetRef.current = { x: 0, y: 0 };
    if (camStreamRef.current) {
      camStreamRef.current.getTracks().forEach((t) => t.stop());
      camStreamRef.current = null;
    }
    if (camVideoRef.current) {
      camVideoRef.current.srcObject = null;
    }
  }, []);

  const toggleCamTrack = useCallback(async () => {
    if (isGyroActiveRef.current) {
      stopCamera();
      return;
    }

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      alert("Camera API is not available in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 320 },
          height: { ideal: 240 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      camStreamRef.current = stream;
      if (!camVideoRef.current) {
        const v = document.createElement("video");
        v.playsInline = true;
        v.muted = true;
        v.autoplay = true;
        camVideoRef.current = v;
      }
      camVideoRef.current.srcObject = stream;
      await camVideoRef.current.play().catch(() => {});

      camBaselineRef.current = null;
      smoothCamRef.current = null;
      isGyroCenteredRef.current = true;
      isGyroActiveRef.current = true;
      setIsGyroActive(true);
    } catch (err) {
      console.error("Camera permission error:", err);
      alert("Camera permission was denied. Please allow camera access to track your face!");
    }
  }, [stopCamera]);

  // Sync with top-right AI Face Cam button on both Phone & Laptop
  useEffect(() => {
    const handleToggle = () => toggleCamTrack();
    window.addEventListener("toggleCamTrack", handleToggle);
    window.addEventListener("toggleVrTilt", handleToggle);
    return () => {
      window.removeEventListener("toggleCamTrack", handleToggle);
      window.removeEventListener("toggleVrTilt", handleToggle);
    };
  }, [toggleCamTrack]);

  useEffect(() => {
    isGyroActiveRef.current = isGyroActive;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("camTrackState", { detail: isGyroActive }));
      window.dispatchEvent(new CustomEvent("vrTiltState", { detail: isGyroActive }));
    }
  }, [isGyroActive]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (camStreamRef.current) {
        camStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Lightweight Real-Time AI Face & Gaze Direction Tracker (BlazeFace 6-Keypoint + 64x48 YCbCr Symmetry Engine)
  useEffect(() => {
    if (!isGyroActive) return;

    let cancelled = false;
    let rafId: number | null = null;

    // 1. Dynamically load ultra-cheap MediaPipe BlazeFace short-range int8 model (~200KB) if not loaded yet
    const initBlazeFace = async () => {
      if (mpDetectorRef.current) return;
      try {
        const visionUrl = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm";
        const vision = await (new Function("url", "return import(url)")(visionUrl));
        const fileset = await vision.FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        const detector = await vision.FaceDetector.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          minDetectionConfidence: 0.45,
        });
        if (!cancelled) {
          mpDetectorRef.current = detector;
        }
      } catch {
        // Fallback to native FaceDetector or built-in 64x48 YCbCr facial symmetry tracker
      }
    };
    initBlazeFace();

    // Offscreen 64x48 canvas for sub-0.15ms pure-JS YCbCr face & eye-symmetry fallback
    const offCanvas = document.createElement("canvas");
    const offW = 64;
    const offH = 48;
    offCanvas.width = offW;
    offCanvas.height = offH;
    const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });

    let lastVideoTime = -1;

    const applyRawFaceGaze = (rawLookX: number, rawLookY: number) => {
      // Calibrate neutral resting face direction over first 6 frames
      if (!camBaselineRef.current) {
        camBaselineRef.current = { x: rawLookX, y: rawLookY, samples: 1 };
        smoothCamRef.current = { x: rawLookX, y: rawLookY };
        return;
      } else if (camBaselineRef.current.samples < 6) {
        const s = camBaselineRef.current.samples;
        camBaselineRef.current.x = (camBaselineRef.current.x * s + rawLookX) / (s + 1);
        camBaselineRef.current.y = (camBaselineRef.current.y * s + rawLookY) / (s + 1);
        camBaselineRef.current.samples = s + 1;
        smoothCamRef.current = { x: camBaselineRef.current.x, y: camBaselineRef.current.y };
        return;
      }

      if (!smoothCamRef.current) {
        smoothCamRef.current = { x: rawLookX, y: rawLookY };
      } else {
        smoothCamRef.current.x += (rawLookX - smoothCamRef.current.x) * 0.38;
        smoothCamRef.current.y += (rawLookY - smoothCamRef.current.y) * 0.38;
      }

      const normX = Math.max(-1, Math.min(1, (smoothCamRef.current.x - camBaselineRef.current.x) * 2.5));
      const normY = Math.max(-1, Math.min(1, (smoothCamRef.current.y - camBaselineRef.current.y) * 2.5));

      const tiltDistance = Math.sqrt(normX * normX + normY * normY);

      // Hysteresis deadband: look at center -> reveals real face; look/move away -> dons 3D mask & tracks face
      if (isGyroCenteredRef.current) {
        if (tiltDistance > 0.20) {
          isGyroCenteredRef.current = false;
        }
      } else {
        if (tiltDistance < 0.13) {
          isGyroCenteredRef.current = true;
        }
      }

      if (isGyroCenteredRef.current) {
        isCursorOnFaceRef.current = true;
        mouseTargetRef.current = { x: 0, y: 0 };
      } else {
        isCursorOnFaceRef.current = false;
        const activeMag = Math.min(1, Math.max(0, (tiltDistance - 0.13) / 0.87));
        const scale = tiltDistance > 0.0001 ? activeMag / tiltDistance : 0;
        mouseTargetRef.current = {
          x: Math.max(-1, Math.min(1, normX * scale)),
          y: Math.max(-1, Math.min(1, normY * scale)),
        };
      }
    };

    const detectFrame = () => {
      if (cancelled) return;
      const video = camVideoRef.current;

      if (video && video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const vw = video.videoWidth || 320;
        const vh = video.videoHeight || 240;

        let handledByNeural = false;

        // Tier 1: BlazeFace 6-Keypoint Neural Head-Pose & Face Tracker
        if (mpDetectorRef.current) {
          try {
            const res = mpDetectorRef.current.detectForVideo(video, performance.now());
            if (res && res.detections && res.detections.length > 0) {
              const det = res.detections[0];
              const bb = det.boundingBox;
              const kps = det.keypoints; // [0: rightEye, 1: leftEye, 2: noseTip, 3: mouth, 4: rightEar, 5: leftEar]

              // Mirrored face center position in frame (-0.5..+0.5)
              const faceCenterX = (bb.originX + bb.width * 0.5) / vw;
              const faceCenterY = (bb.originY + bb.height * 0.5) / vh;
              const posLookX = 0.5 - faceCenterX; // positive = user moved right
              const posLookY = faceCenterY - 0.5; // positive = user moved down

              let yawLookX = 0;
              let pitchLookY = 0;

              if (kps && kps.length >= 4) {
                const kpEye0 = kps[0];
                const kpEye1 = kps[1];
                const kpNose = kps[2];
                const kpMouth = kps[3];

                const eyeMidX = (kpEye0.x + kpEye1.x) * 0.5;
                const eyeMidY = (kpEye0.y + kpEye1.y) * 0.5;
                const eyeDist = Math.max(0.02, Math.abs(kpEye1.x - kpEye0.x));
                const eyeToMouth = Math.max(0.02, Math.abs(kpMouth.y - eyeMidY));

                // When user turns head right, noseTip.x shifts left in un-mirrored camera coordinates
                yawLookX = ((eyeMidX - kpNose.x) / eyeDist) * 0.85;
                // When user tilts head down, noseTip.y moves down relative to eye-mouth span
                pitchLookY = ((kpNose.y - eyeMidY) / eyeToMouth - 0.55) * 0.95;
              }

              // Combine head rotation (yaw/pitch) + head position in camera frame
              const combinedX = yawLookX * 0.65 + posLookX * 0.95;
              const combinedY = pitchLookY * 0.65 + posLookY * 1.05;

              applyRawFaceGaze(combinedX, combinedY);
              handledByNeural = true;
            }
          } catch {
            /* fallback to Tier 2 */
          }
        }

        // Tier 2: Instant 64x48 YCbCr Skin + Eye-Feature Symmetry Tracker (0ms latency fallback)
        if (!handledByNeural && offCtx) {
          offCtx.drawImage(video, 0, 0, offW, offH);
          const imgData = offCtx.getImageData(0, 0, offW, offH).data;

          let sumX = 0;
          let sumY = 0;
          let count = 0;
          let minX = offW,
            maxX = 0,
            minY = offH,
            maxY = 0;

          for (let y = 2; y < offH - 2; y++) {
            for (let x = 2; x < offW - 2; x++) {
              const i = (y * offW + x) * 4;
              const r = imgData[i];
              const g = imgData[i + 1];
              const b = imgData[i + 2];

              const luma = 0.299 * r + 0.587 * g + 0.114 * b;
              const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
              const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

              if (luma > 42 && cb >= 82 && cb <= 132 && cr >= 132 && cr <= 182) {
                sumX += x;
                sumY += y;
                count++;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }

          if (count > 28) {
            const cx = sumX / count / offW;
            const cy = sumY / count / offH;

            // Estimate eye/brow dark feature centroid inside upper half of face box for head yaw/pitch
            let darkSumX = 0,
              darkSumY = 0,
              darkWeight = 0;
            const upperMaxY = Math.min(offH - 1, Math.floor(minY + (maxY - minY) * 0.6));
            for (let y = minY; y <= upperMaxY; y++) {
              for (let x = minX; x <= maxX; x++) {
                const i = (y * offW + x) * 4;
                const luma = 0.299 * imgData[i] + 0.587 * imgData[i + 1] + 0.114 * imgData[i + 2];
                const darkness = Math.max(0, 140 - luma);
                if (darkness > 25) {
                  darkSumX += x * darkness;
                  darkSumY += y * darkness;
                  darkWeight += darkness;
                }
              }
            }

            let featureYaw = 0;
            let featurePitch = 0;
            if (darkWeight > 0 && maxX > minX + 4 && maxY > minY + 4) {
              const featX = darkSumX / darkWeight / offW;
              const featY = darkSumY / darkWeight / offH;
              featureYaw = (cx - featX) * 2.2;
              featurePitch = (featY - cy) * 2.0;
            }

            const posLookX = 0.5 - cx;
            const posLookY = cy - 0.5;
            applyRawFaceGaze(posLookX * 1.15 + featureYaw * 0.6, posLookY * 1.25 + featurePitch * 0.6);
          }
        }
      }

      rafId = requestAnimationFrame(detectFrame);
    };

    rafId = requestAnimationFrame(detectFrame);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isGyroActive]);

  // 2D Face refs
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const blinkImagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const smoothCoordRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isCursorOnFaceRef = useRef<boolean>(true);
  const animFrameIdRef = useRef<number | null>(null);
  const lastDrawnKeyRef = useRef<string | null>(null);

  // 3D Mask Donning & Assembly refs
  const threeSceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    pivot: THREE.Group | null;
    wireframePivot: THREE.Group | null;
    clipPlane: THREE.Plane;
    wireframeMat: THREE.MeshBasicMaterial;
    cyanLight: THREE.DirectionalLight;
    magentaLight: THREE.DirectionalLight;
    topLight: THREE.DirectionalLight;
    ambient: THREE.AmbientLight;
    flashLight: THREE.PointLight;
    isModelLoaded: boolean;
  } | null>(null);

  // Donning progress: 0 = cursor on face (not wearing mask), 0 -> 1 = donning transition sweeps down, 1 = fully worn & tracking cursor
  const wearProgressRef = useRef<number>(0);
  const lastFaceOpacityRef = useRef<number>(1);

  const drawSmallMaskLightning = useCallback(
    (ctx: CanvasRenderingContext2D, canvasSize: number, strikeSeed: number) => {
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      const cx = canvasSize * 0.5;
      const cy = canvasSize * 0.5;

      // Deterministic pseudo-random generator for organic recursive fractal displacement
      let prng = Math.floor(strikeSeed * 9173 + (performance.now() % 1000) * 17) || 1;
      const nextRand = () => {
        prng = (prng * 16807) % 2147483647;
        return (prng - 1) / 2147483646 - 0.5;
      };

      // Recursive midpoint displacement for authentic high-voltage plasma geometry
      const buildFractalPath = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        displace: number,
        depth: number
      ): Array<{ x: number; y: number }> => {
        if (depth <= 0) {
          return [
            { x: x1, y: y1 },
            { x: x2, y: y2 },
          ];
        }
        const mx = (x1 + x2) * 0.5;
        const my = (y1 + y2) * 0.5;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const offset = nextRand() * displace;
        const px = mx + nx * offset;
        const py = my + ny * offset;

        const left = buildFractalPath(x1, y1, px, py, displace * 0.54, depth - 1);
        const right = buildFractalPath(px, py, x2, y2, displace * 0.54, depth - 1);
        return left.slice(0, -1).concat(right);
      };

      const renderPlasmaArc = (
        pts: Array<{ x: number; y: number }>,
        glowColor: string,
        rootWidth: number,
        tipWidth: number,
        alphaScale: number
      ) => {
        if (pts.length < 2) return;
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // 1. Soft atmospheric plasma halo
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.strokeStyle = glowColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 18;
        ctx.lineWidth = rootWidth * 2.2;
        ctx.globalAlpha = 0.38 * alphaScale;
        ctx.stroke();

        // 2. Tapered segment-by-segment white-hot plasma channel
        for (let i = 0; i < pts.length - 1; i++) {
          const t = i / (pts.length - 1);
          const w = rootWidth * (1 - t) + tipWidth * t;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
          ctx.strokeStyle = "#ffffff";
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 8;
          ctx.lineWidth = w;
          ctx.globalAlpha = (0.98 - t * 0.25) * alphaScale;
          ctx.stroke();
        }
        ctx.restore();
      };

      const drawRealisticBolt = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        glowColor: string,
        rootWidth: number
      ) => {
        const dist = Math.hypot(x2 - x1, y2 - y1);
        const mainPts = buildFractalPath(x1, y1, x2, y2, dist * 0.22, 5);
        renderPlasmaArc(mainPts, glowColor, rootWidth, rootWidth * 0.35, 1.0);

        // Subtle contact flash flare at the origin point on the mask
        const grad = ctx.createRadialGradient(x1, y1, 0, x1, y1, 18);
        grad.addColorStop(0, "rgba(255,255,255,0.85)");
        grad.addColorStop(0.35, glowColor);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.save();
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc(x1, y1, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2 delicate hair-thin secondary micro-tendrils branching off the main channel
        const branchIndices = [Math.floor(mainPts.length * 0.35), Math.floor(mainPts.length * 0.65)];
        branchIndices.forEach((bIdx, idx) => {
          const p = mainPts[bIdx];
          if (!p) return;
          const angle = Math.atan2(y2 - y1, x2 - x1) + (idx % 2 === 0 ? 0.55 : -0.55) + nextRand() * 0.25;
          const bLen = dist * (0.28 + Math.abs(nextRand()) * 0.15);
          const bx = p.x + Math.cos(angle) * bLen;
          const by = p.y + Math.sin(angle) * bLen;
          const branchPts = buildFractalPath(p.x, p.y, bx, by, bLen * 0.24, 4);
          renderPlasmaArc(branchPts, glowColor, rootWidth * 0.55, 0.3, 0.72);
        });
      };

      // Only 2 crisp, realistic electric discharges tracing the mask's left and right cheek/eye facets
      drawRealisticBolt(
        cx - canvasSize * 0.15,
        cy - canvasSize * 0.06,
        cx - canvasSize * 0.04,
        cy + canvasSize * 0.20,
        "#ec4899",
        1.65
      );
      drawRealisticBolt(
        cx + canvasSize * 0.15,
        cy - canvasSize * 0.06,
        cx + canvasSize * 0.04,
        cy + canvasSize * 0.20,
        "#22d3ee",
        1.65
      );
    },
    []
  );

  const drawImageToCanvas = useCallback(
    (img: HTMLImageElement, key: string) => {
      const canvas = faceCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      lastDrawnKeyRef.current = key;
    },
    [size]
  );

  // Instant initial face frame so user never sees a black or blank canvas on load
  useEffect(() => {
    const initImg = new window.Image();
    initImg.src = "/gaze_frames/blink_0000.webp";
    initImg.onload = () => {
      if (lastDrawnKeyRef.current === null) {
        drawImageToCanvas(initImg, "initial_face");
      }
    };
  }, [drawImageToCanvas]);

  // 1. Initialize Three.js Scene with Local Clipping & Hot Pink Laser Assembly Seam
  useEffect(() => {
    const canvas = threeCanvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 3.6);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2));
    renderer.setSize(size, size, false);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.backgroundColor = "transparent";
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // Enable local clipping planes for progressive slicing assembly
    renderer.localClippingEnabled = true;

    // Clipping plane for the solid mask plates (points with y >= -constant are kept)
    const clipPlane = new THREE.Plane(new THREE.Vector3(-0.25, 1, 0).normalize(), -3.0);

    // Cyberpunk ambient & neon directional lights matching hero palette
    const ambient = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambient);

    // Cyan Neon Rim Light from Left
    const cyanLight = new THREE.DirectionalLight(0x22d3ee, 5.2);
    cyanLight.position.set(-3, 2, 2.5);
    scene.add(cyanLight);

    // Magenta Neon Rim Light from Right
    const magentaLight = new THREE.DirectionalLight(0xec4899, 5.2);
    magentaLight.position.set(3, 1.5, 2.5);
    scene.add(magentaLight);

    // Top Rim Light
    const topLight = new THREE.DirectionalLight(0xffffff, 2.5);
    topLight.position.set(0, 4, 1);
    scene.add(topLight);

    // Front Electric Flash Point Light for Scroll Lightning Surge
    const flashLight = new THREE.PointLight(0xffffff, 0, 12);
    flashLight.position.set(0, 0.05, 2.2);
    scene.add(flashLight);

    // Cyan holographic wireframe material outlining face & mask features
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x7ee8ff,
      wireframe: true,
      transparent: true,
      opacity: 0,
    });

    const sceneState = {
      scene,
      camera,
      renderer,
      pivot: null as THREE.Group | null,
      wireframePivot: null as THREE.Group | null,
      clipPlane,
      wireframeMat,
      cyanLight,
      magentaLight,
      topLight,
      ambient,
      flashLight,
      isModelLoaded: false,
    };
    threeSceneRef.current = sceneState;

    // Load 3D Mask GLB (Squid Game Boss Mask)
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const root = gltf.scene;

        // Hide pedestal/stand objects and configure solid mask material with clipping plane
        root.traverse((child) => {
          if (child.name.includes("Circle") || child.name === "Object_6") {
            child.visible = false;
          }
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.side = THREE.DoubleSide;
              mat.roughness = 0.32;
              mat.metalness = 0.72;
              mat.clippingPlanes = [clipPlane];
              mat.clipShadows = true;
            }
          }
        });

        // Compute bounding box strictly of the visible mask
        const box = new THREE.Box3();
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh && child.visible) {
            box.expandByObject(child);
          }
        });

        const center = box.getCenter(new THREE.Vector3());
        const sizeVec = box.getSize(new THREE.Vector3());

        root.position.x = -center.x;
        root.position.y = -center.y;
        root.position.z = -center.z;

        const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
        const targetScale = 2.45 / (maxDim || 1);

        // 1. Solid Mask Pivot Group
        const pivot = new THREE.Group();
        pivot.add(root);
        pivot.scale.setScalar(targetScale);
        pivot.visible = false;
        scene.add(pivot);

        // 2. Holographic Wireframe Overlay (outlining face features as in reference mockup)
        const wireframeRoot = root.clone(true);
        wireframeRoot.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = wireframeMat;
          }
        });
        const wireframePivot = new THREE.Group();
        wireframePivot.add(wireframeRoot);
        wireframePivot.scale.setScalar(targetScale);
        wireframePivot.visible = false;
        scene.add(wireframePivot);

        sceneState.pivot = pivot;
        sceneState.wireframePivot = wireframePivot;
        sceneState.isModelLoaded = true;
      },
      undefined,
      (error) => {
        console.warn("Could not load 3D character:", error);
      }
    );

    return () => {
      renderer.dispose();
      scene.clear();
      threeSceneRef.current = null;
    };
  }, [modelUrl, size]);

  // 2. Fetch manifest.json & preload gaze + blink frames for 2D face
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

        // Preload blink frames first
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

        // Lazy load remaining gaze frames
        setTimeout(() => {
          if (cancelled) return;
          data.frames.forEach((f) => {
            if (imagesRef.current.has(f.id)) return;
            const img = new window.Image();
            img.decoding = "async";
            img.src = f.file;
            img.onload = () => {
              if (!cancelled) {
                imagesRef.current.set(f.id, img);
              }
            };
          });
        }, 100);
      })
      .catch(() => {
        /* manifest not ready */
      });

    return () => {
      cancelled = true;
    };
  }, [manifestUrl, drawImageToCanvas]);

  // 3. 60fps/120fps Render Loop: First Wear Mask via Slicing Transition, Then Follow & Move
  const renderFrame = useCallback(() => {
    // Smooth lerp coordinates
    const lerpFactor = 0.22;
    smoothCoordRef.current.x +=
      (mouseTargetRef.current.x - smoothCoordRef.current.x) * lerpFactor;
    smoothCoordRef.current.y +=
      (mouseTargetRef.current.y - smoothCoordRef.current.y) * lerpFactor;

    const sx = smoothCoordRef.current.x;
    const sy = smoothCoordRef.current.y;

    // Gaze-triggered confirmation modal:
    // Only triggers when at top of page (never while scrolling)
    const currentScrollY =
      typeof window !== "undefined"
        ? window.scrollY || document.documentElement.scrollTop || 0
        : 0;
    const isMobileView = typeof window !== "undefined" && window.innerWidth < 640;
    const isNotScrolling =
      currentScrollY < 15 && performance.now() - lastScrollTimeRef.current > 400;
    const isAnyModalOpen = activeModalsRef.current.size > 0;

    let focusedGaze: "resapori" | "mariojuice" | null = null;

    if (isNotScrolling && !isAnyModalOpen && !isCursorOnFaceRef.current) {
      if (isMobileView) {
        // On mobile: works both in VR Tilt mode and intentional touch-look gesture
        const threshold = isGyroActiveRef.current ? 0.44 : 0.50;
        if (sy < -threshold) focusedGaze = "resapori"; // Looking up at top logo (Re Sapori)
        else if (sy > threshold) focusedGaze = "mariojuice"; // Looking down at bottom logo (Mario Juice)
      } else {
        // On laptop: looking left/right towards logo triggers
        if (sx < -0.60) focusedGaze = "resapori";
        else if (sx > 0.60) focusedGaze = "mariojuice";
      }
    }

    if (focusedGaze) {
      if (gazeTargetTimerRef.current.target === focusedGaze) {
        const requiredHoldTime = isMobileView ? 480 : 380;
        if (
          !gazeTargetTimerRef.current.fired &&
          performance.now() - gazeTargetTimerRef.current.start > requiredHoldTime
        ) {
          gazeTargetTimerRef.current.fired = true;
          if (focusedGaze === "resapori") {
            window.dispatchEvent(new CustomEvent("gazeAtResapori"));
          } else {
            window.dispatchEvent(new CustomEvent("gazeAtMarioJuice"));
          }
        }
      } else {
        gazeTargetTimerRef.current = {
          target: focusedGaze,
          start: performance.now(),
          fired: false,
        };
      }
    } else {
      // Reset once gaze returns toward neutral center so looking again re-triggers cleanly
      const returnedToNeutral = isMobileView
        ? Math.abs(sy) < 0.32
        : Math.abs(sx) < 0.42;
      if (returnedToNeutral || !isNotScrolling) {
        gazeTargetTimerRef.current = { target: null, start: 0, fired: false };
      }
    }

    // ------------------------------------------------------------------------
    // SCROLL DOUBLE-LIGHTNING SEQUENCE:
    // ------------------------------------------------------------------------
    // FAST SCROLL LIGHTING STROBE & DISAPPEAR IN PLACE:
    // "make the lighting and come and disappear quickly then comes and
    //  disappears and doesnt make the movement of the mask to the top
    //  it disappears in its place when i scroll down and this should
    //  happen fast before the marwan laboudy gets out of the frame"
    // ------------------------------------------------------------------------
    if (currentScrollY <= 3 && (scrollLightningRef.current.armed || scrollLightningRef.current.finishedForever)) {
      // Returned to top of hero: reset so portrait is interactive again at top
      scrollLightningRef.current = {
        armed: false,
        started: false,
        startTime: 0,
        finishedForever: false,
        soundPlayed: false,
      };
      if (containerRef.current) {
        containerRef.current.style.opacity = "1";
        containerRef.current.style.pointerEvents = "";
      }
      if (threeSceneRef.current) {
        threeSceneRef.current.cyanLight.intensity = 5.2;
        threeSceneRef.current.magentaLight.intensity = 5.2;
        threeSceneRef.current.topLight.intensity = 2.5;
        threeSceneRef.current.flashLight.intensity = 0;
      }
    } else if (
      currentScrollY > 6 &&
      !scrollLightningRef.current.armed &&
      !scrollLightningRef.current.finishedForever
    ) {
      scrollLightningRef.current.armed = true;
      scrollLightningRef.current.started = true;
      scrollLightningRef.current.startTime = performance.now();
      isCursorOnFaceRef.current = false;
      wearProgressRef.current = 1.0;
      smoothCoordRef.current = { x: 0, y: 0 };
      mouseTargetRef.current = { x: 0, y: 0 };
      playScaryFlashSound();
    }

    if (scrollLightningRef.current.armed && !scrollLightningRef.current.finishedForever) {
      isCursorOnFaceRef.current = false;
      wearProgressRef.current = 1.0;
      smoothCoordRef.current = { x: 0, y: 0 };
      mouseTargetRef.current = { x: 0, y: 0 };
    }

    // ------------------------------------------------------------------------
    // STATE MACHINE:
    // Cursor on face: wearTarget = 0 (un-wears mask, natural face active).
    // Cursor leaves face: wearTarget = 1 (FIRST triggers donning transition, THEN tracks & moves).
    // ------------------------------------------------------------------------
    const isModelReady = threeSceneRef.current?.isModelLoaded ?? false;
    const targetWear = isModelReady && !isCursorOnFaceRef.current ? 1.0 : 0.0;

    const wearSpeed = targetWear > wearProgressRef.current ? 0.09 : 0.16;
    wearProgressRef.current += (targetWear - wearProgressRef.current) * wearSpeed;
    if (targetWear === 0 && wearProgressRef.current < 0.012) {
      wearProgressRef.current = 0;
    }
    const wear = wearProgressRef.current;

    // ------------------------------------------------------------------------
    // Dynamic Face Visibility:
    // Fades out earlier as the mask descends onto the face (starting at 0.12, fully gone by 0.58)
    // ------------------------------------------------------------------------
    const faceOpacity = wear <= 0.12 ? 1 : Math.max(0, 1 - (wear - 0.12) / 0.46);
    if (faceCanvasRef.current && Math.abs(lastFaceOpacityRef.current - faceOpacity) > 0.005) {
      lastFaceOpacityRef.current = faceOpacity;
      faceCanvasRef.current.style.opacity = faceOpacity.toFixed(3);
    }

    // Render 2D Face frames: only when face is actually visible (saves frame budget!)
    if (faceOpacity > 0.01 && manifest) {
      const blinkCount = manifest.blinkFrames?.length ?? 0;

      if (
        isCursorOnFaceRef.current &&
        blinkCount > 0 &&
        blinkImagesRef.current.size > 0
      ) {
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

    // ------------------------------------------------------------------------
    // Render 3D Mask Donning & Movement:
    // "First it makes me wear it with this transition, then it moves"
    // ------------------------------------------------------------------------
    if (threeSceneRef.current) {
      const {
        scene,
        camera,
        renderer,
        pivot,
        wireframePivot,
        clipPlane,
        wireframeMat,
        cyanLight,
        magentaLight,
        topLight,
        flashLight,
      } = threeSceneRef.current;

      if (pivot && wireframePivot) {
        // Tracking weight delay:
        // While wearing (wear < 0.45): head stays locked centered so donning transition executes on the face!
        // As mask completes donning (0.45 -> 1.0): tracking weight ramps to 1.0, tracking cursor in full 3D!
        const trackingWeight = Math.max(0, Math.min(1, (wear - 0.40) / 0.60));

        pivot.rotation.y = sx * 1.15 * trackingWeight;
        pivot.rotation.x = sy * 0.55 * trackingWeight;
        pivot.rotation.z = -sx * 0.12 * trackingWeight;

        const breath = Math.sin(performance.now() * 0.0028) * 0.025;
        pivot.position.x = sx * 0.15 * trackingWeight;
        pivot.position.y = -sy * 0.12 * trackingWeight + breath;

        wireframePivot.rotation.copy(pivot.rotation);
        wireframePivot.position.copy(pivot.position);

        // Fast double-lighting strobe & large visible lightning in place on scroll
        let isLightningFlashOn = false;
        if (scrollLightningRef.current.started && !scrollLightningRef.current.finishedForever) {
          const timeElapsed = performance.now() - scrollLightningRef.current.startTime;
          // Accelerate with scroll distance so it ALWAYS finishes in parallel before MARWAN LABOUDY exits frame
          const scrollElapsed = (currentScrollY / 210) * 355;
          const elapsed = Math.max(timeElapsed, scrollElapsed);
          const lCanvas = lightningCanvasRef.current;
          const lCtx = lCanvas ? lCanvas.getContext("2d") : null;

          if (elapsed < 130) {
            // Flash 1: "make the lighting and come" + large lightning
            isLightningFlashOn = true;
            if (containerRef.current) containerRef.current.style.opacity = "1";
            cyanLight.intensity = 26.0;
            magentaLight.intensity = 26.0;
            topLight.intensity = 10.0;
            flashLight.intensity = 7.5;
            if (lCtx) drawSmallMaskLightning(lCtx, size, 1);
          } else if (elapsed < 210) {
            // Cut 1: "and disappear quickly"
            isLightningFlashOn = false;
            if (containerRef.current) containerRef.current.style.opacity = "0";
            cyanLight.intensity = 0;
            magentaLight.intensity = 0;
            topLight.intensity = 0;
            flashLight.intensity = 0;
            if (lCtx) lCtx.clearRect(0, 0, size, size);
          } else if (elapsed < 350) {
            // Flash 2: "then comes" + large lightning
            isLightningFlashOn = true;
            if (containerRef.current) containerRef.current.style.opacity = "1";
            cyanLight.intensity = 28.0;
            magentaLight.intensity = 28.0;
            topLight.intensity = 12.0;
            flashLight.intensity = 8.5;
            if (lCtx) drawSmallMaskLightning(lCtx, size, 2);
          } else {
            // Final Cut: "and disappears" in its place before MARWAN LABOUDY leaves frame
            isLightningFlashOn = false;
            scrollLightningRef.current.finishedForever = true;
            if (containerRef.current) {
              containerRef.current.style.opacity = "0";
              containerRef.current.style.pointerEvents = "none";
            }
            cyanLight.intensity = 0;
            magentaLight.intensity = 0;
            topLight.intensity = 0;
            flashLight.intensity = 0;
            if (lCtx) lCtx.clearRect(0, 0, size, size);
          }
        } else if (scrollLightningRef.current.finishedForever) {
          if (containerRef.current && containerRef.current.style.opacity !== "0") {
            containerRef.current.style.opacity = "0";
            containerRef.current.style.pointerEvents = "none";
          }
        }

        if (wear > 0.001) {
          if (!pivot.visible) pivot.visible = true;

          // Dynamic angled cut matching the reference mockup:
          // Angled diagonally across the forehead and eyes
          const tiltX = sx >= 0 ? -0.28 : 0.28;
          const planeNormal = new THREE.Vector3(tiltX, 1, 0).normalize();
          clipPlane.normal.copy(planeNormal);

          // Progressive slice height:
          // wear = 0.0: constant = -1.55 (above forehead)
          // wear = 0.5: constant = +0.10 (mid-face)
          // wear = 1.0: constant = +1.80 (chin, fully covering)
          const clipConstant = -1.55 + wear * 3.35;
          clipPlane.constant = clipConstant;

          // Holographic wireframe: only visible during the active donning transition window
          const showDonningWireframe = !isLightningFlashOn && wear > 0.02 && wear < 0.94;
          wireframePivot.visible = showDonningWireframe;
          if (showDonningWireframe) {
            wireframeMat.opacity = Math.sin(wear * Math.PI) * 0.70;
          }

          renderer.render(scene, camera);
        } else {
          // Completely off / inside face area - clear once and pause rendering
          if (pivot.visible) {
            pivot.visible = false;
            wireframePivot.visible = false;
            clipPlane.constant = -3.0;
            wireframeMat.opacity = 0;
            renderer.setClearColor(0x000000, 0);
            renderer.clear();
          }
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(renderFrame);
  }, [manifest, drawImageToCanvas, drawSmallMaskLightning, playScaryFlashSound, size]);

  useEffect(() => {
    animFrameIdRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [renderFrame]);

  // 4. Cursor, Touch & Scroll Tracking (determines when cursor is ON vs OUT of face)
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

      // Scroll downward tracking: as scroll increases, face tilts down towards work
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const scrollRatio = Math.min(1, Math.max(0, scrollY / 850));

      // Face bounding radius: bounds the central face area
      const faceRadiusX = rect.width * 0.20;
      const faceRadiusY = rect.height * 0.26;
      const normFaceDist =
        (deltaX / faceRadiusX) ** 2 + (deltaY / faceRadiusY) ** 2;

      // 1. When cursor is on the face: lock in center, keep real face active
      if (normFaceDist <= 1.0 && scrollRatio < 0.05) {
        isCursorOnFaceRef.current = true;
        mouseTargetRef.current = { x: 0, y: 0 };
        return;
      }

      // 2. Cursor moved OUT of the face area: triggers donning transition, then tracks!
      isCursorOnFaceRef.current = false;

      const signX = deltaX >= 0 ? 1 : -1;
      const signY = deltaY >= 0 ? 1 : -1;

      const excessX = Math.max(0, Math.abs(deltaX) - faceRadiusX);
      const excessY = Math.max(0, Math.abs(deltaY) - faceRadiusY);

      const maxExcessX = Math.max(120, (signX > 0 ? window.innerWidth - faceCenterX : faceCenterX) - faceRadiusX);
      const maxExcessY = Math.max(120, (signY > 0 ? window.innerHeight - faceCenterY : faceCenterY) - faceRadiusY);

      const normX = signX * Math.min(1, (excessX / maxExcessX) * 1.18 + (excessX > 0 ? 0.025 : 0));
      const normY = signY * Math.min(1, (excessY / maxExcessY) * 1.18 + (excessY > 0 ? 0.025 : 0));

      const targetY = normY * (1 - scrollRatio);
      const targetX = normX * (1 - scrollRatio);

      mouseTargetRef.current = { x: targetX, y: targetY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isGyroActiveRef.current) return;
      if (scrollLightningRef.current.armed && !scrollLightningRef.current.finishedForever) return;
      updateFromClientXY(e.clientX, e.clientY);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (isGyroActiveRef.current) return;
      if (scrollLightningRef.current.armed && !scrollLightningRef.current.finishedForever) return;
      const target = e.target as HTMLElement | null;
      if (target && target.closest("button, a")) return;
      if (e.touches.length > 0) {
        updateFromClientXY(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isGyroActiveRef.current) return;
      if (scrollLightningRef.current.armed && !scrollLightningRef.current.finishedForever) return;
      if (e.touches.length > 0) {
        updateFromClientXY(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onScroll = () => {
      lastScrollTimeRef.current = performance.now();
      gazeTargetTimerRef.current = { target: null, start: 0, fired: false };
      const sy = window.scrollY || document.documentElement.scrollTop || 0;
      if (
        sy > 6 &&
        !scrollLightningRef.current.armed &&
        !scrollLightningRef.current.finishedForever
      ) {
        scrollLightningRef.current.armed = true;
        scrollLightningRef.current.started = true;
        scrollLightningRef.current.startTime = performance.now();
        isCursorOnFaceRef.current = false;
        wearProgressRef.current = 1.0;
        smoothCoordRef.current = { x: 0, y: 0 };
        mouseTargetRef.current = { x: 0, y: 0 };
        playScaryFlashSound();
        return;
      }
      if (isGyroActiveRef.current) return;
      if (scrollLightningRef.current.armed && !scrollLightningRef.current.finishedForever) return;
      updateFromClientXY(lastClientPos.x, lastClientPos.y);
    };

    const onWheel = (e: WheelEvent) => {
      if (
        e.deltaY > 4 &&
        !scrollLightningRef.current.armed &&
        !scrollLightningRef.current.finishedForever
      ) {
        playScaryFlashSound();
      }
    };

    const onMouseLeave = (e: MouseEvent) => {
      if (isGyroActiveRef.current) return;
      if (scrollLightningRef.current.armed && !scrollLightningRef.current.finishedForever) return;
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
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [playScaryFlashSound]);

  return (
    <div
      ref={containerRef}
      className={`relative block select-none ${className}`}
      style={{ width: size, aspectRatio: "1 / 1" }}
    >
      {/* 2D Real Face Canvas: Always active underneath, visible through unmasked areas */}
      <canvas
        ref={faceCanvasRef}
        width={size}
        height={size}
        style={{ width: "100%", height: "100%" }}
        className="absolute inset-0 block h-full w-full select-none pointer-events-none drop-shadow-[-16px_0_36px_rgba(126,232,255,0.22)] drop-shadow-[16px_0_36px_rgba(255,47,185,0.25)] will-change-transform"
      />

      {/* 3D Mask Canvas: Donning transition with obsidian facet reflections & wireframe */}
      <canvas
        ref={threeCanvasRef}
        width={size}
        height={size}
        style={{ width: "100%", height: "100%" }}
        className="absolute inset-0 block h-full w-full select-none pointer-events-none drop-shadow-[-16px_0_36px_rgba(126,232,255,0.28)] drop-shadow-[16px_0_36px_rgba(255,47,185,0.32)] will-change-transform"
      />

      {/* Subtle Small Electric Lightning Overlay on Mask */}
      <canvas
        ref={lightningCanvasRef}
        width={size}
        height={size}
        style={{ width: "100%", height: "100%" }}
        className="absolute inset-0 block h-full w-full select-none pointer-events-none will-change-transform"
      />
    </div>
  );
}

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

  const [manifest, setManifest] = useState<ManifestData | null>(null);
  const [isGyroActive, setIsGyroActive] = useState<boolean>(false);
  const isGyroActiveRef = useRef<boolean>(false);
  const isGyroCenteredRef = useRef<boolean>(true);
  const initialOrientationRef = useRef<{ beta: number; gamma: number; samples: number } | null>(null);
  const smoothGyroRef = useRef<{ beta: number; gamma: number } | null>(null);
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

  const toggleGyro = useCallback(async () => {
    if (isGyroActiveRef.current) {
      isGyroActiveRef.current = false;
      setIsGyroActive(false);
      initialOrientationRef.current = null;
      smoothGyroRef.current = null;
      isGyroCenteredRef.current = true;
      isCursorOnFaceRef.current = true;
      mouseTargetRef.current = { x: 0, y: 0 };
      return;
    }

    if (
      typeof window !== "undefined" &&
      typeof (window as any).DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const state = await (DeviceOrientationEvent as any).requestPermission();
        if (state === "granted") {
          initialOrientationRef.current = null;
          smoothGyroRef.current = null;
          isGyroCenteredRef.current = true;
          isGyroActiveRef.current = true;
          setIsGyroActive(true);
        } else {
          alert("Motion permission denied. You can swipe with your finger to control the mask!");
        }
      } catch (err) {
        console.error("Device orientation permission error:", err);
      }
    } else {
      initialOrientationRef.current = null;
      smoothGyroRef.current = null;
      isGyroCenteredRef.current = true;
      isGyroActiveRef.current = true;
      setIsGyroActive(true);
    }
  }, []);

  // Sync with stationary external mobile toggle button
  useEffect(() => {
    const handleToggle = () => toggleGyro();
    window.addEventListener("toggleVrTilt", handleToggle);
    return () => window.removeEventListener("toggleVrTilt", handleToggle);
  }, [toggleGyro]);

  useEffect(() => {
    isGyroActiveRef.current = isGyroActive;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("vrTiltState", { detail: isGyroActive }));
    }
  }, [isGyroActive]);

  // Gyroscope Device Orientation Listener (VR Tilt)
  useEffect(() => {
    if (!isGyroActive) return;

    const enableTimestamp = performance.now();

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;

      // Ignore the first 120ms right after tapping the top-right VR button so thumb tap vibration settles
      if (performance.now() - enableTimestamp < 120) return;

      const rawBeta = Math.max(-170, Math.min(170, e.beta));
      const rawGamma = Math.max(-89, Math.min(89, e.gamma));

      // Calibrate baseline over the first 5 samples for a rock-solid neutral reference
      if (!initialOrientationRef.current) {
        initialOrientationRef.current = { beta: rawBeta, gamma: rawGamma, samples: 1 };
        smoothGyroRef.current = { beta: rawBeta, gamma: rawGamma };
        return;
      } else if (initialOrientationRef.current.samples < 5) {
        const s = initialOrientationRef.current.samples;
        initialOrientationRef.current.beta = (initialOrientationRef.current.beta * s + rawBeta) / (s + 1);
        initialOrientationRef.current.gamma = (initialOrientationRef.current.gamma * s + rawGamma) / (s + 1);
        initialOrientationRef.current.samples = s + 1;
        smoothGyroRef.current = {
          beta: initialOrientationRef.current.beta,
          gamma: initialOrientationRef.current.gamma,
        };
        return;
      }

      // Low-pass filter raw sensor stream to eliminate micro-jitter and gimbal spikes
      if (!smoothGyroRef.current) {
        smoothGyroRef.current = { beta: rawBeta, gamma: rawGamma };
      } else {
        let dG = rawGamma - smoothGyroRef.current.gamma;
        // Guard against gimbal lock flip near 90 deg beta
        if (Math.abs(dG) > 90) {
          dG = 0;
        }
        smoothGyroRef.current.gamma += dG * 0.35;
        smoothGyroRef.current.beta += (rawBeta - smoothGyroRef.current.beta) * 0.35;
      }

      const deltaGamma = smoothGyroRef.current.gamma - initialOrientationRef.current.gamma;
      const deltaBeta = smoothGyroRef.current.beta - initialOrientationRef.current.beta;

      // 18 degrees for full deflection so user can comfortably tilt up/down/left/right while viewing screen
      const normX = Math.max(-1, Math.min(1, deltaGamma / 18));
      const normY = Math.max(-1, Math.min(1, deltaBeta / 18));

      const tiltDistance = Math.sqrt(normX * normX + normY * normY);

      // Hysteresis deadband to prevent flickering between face & mask near the center threshold
      if (isGyroCenteredRef.current) {
        if (tiltDistance > 0.22) {
          isGyroCenteredRef.current = false;
        }
      } else {
        if (tiltDistance < 0.14) {
          isGyroCenteredRef.current = true;
        }
      }

      if (isGyroCenteredRef.current) {
        // Phone is in neutral middle holding position -> unwear mask & reveal real face
        isCursorOnFaceRef.current = true;
        mouseTargetRef.current = { x: 0, y: 0 };
      } else {
        // Phone is tilted away from center -> don mask & smoothly ramp angle from 0 at deadband edge
        isCursorOnFaceRef.current = false;
        const activeMag = Math.min(1, Math.max(0, (tiltDistance - 0.14) / 0.86));
        const scale = tiltDistance > 0.0001 ? activeMag / tiltDistance : 0;
        mouseTargetRef.current = {
          x: Math.max(-1, Math.min(1, normX * scale)),
          y: Math.max(-1, Math.min(1, normY * scale)),
        };
      }
    };

    window.addEventListener("deviceorientation", handleOrientation, { passive: true });
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
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
    isModelLoaded: boolean;
  } | null>(null);

  // Donning progress: 0 = cursor on face (not wearing mask), 0 -> 1 = donning transition sweeps down, 1 = fully worn & tracking cursor
  const wearProgressRef = useRef<number>(0);
  const lastFaceOpacityRef = useRef<number>(1);

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
    // STATE MACHINE:
    // Cursor on face: wearTarget = 0 (un-wears mask, natural face active).
    // Cursor leaves face: wearTarget = 1 (FIRST triggers donning transition, THEN tracks & moves).
    // ------------------------------------------------------------------------
    const isModelReady = threeSceneRef.current?.isModelLoaded ?? false;
    const targetWear = isModelReady && !isCursorOnFaceRef.current ? 1.0 : 0.0;

    // Smooth, cinematic donning animation speed (~320ms)
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

          // Holographic wireframe: only visible during the active transition window
          const showWireframe = wear > 0.02 && wear < 0.94;
          wireframePivot.visible = showWireframe;
          if (showWireframe) {
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
  }, [manifest, drawImageToCanvas]);

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

      const targetY = normY * (1 - scrollRatio) + 1.0 * scrollRatio;
      const targetX = normX * (1 - scrollRatio * 0.45);

      mouseTargetRef.current = { x: targetX, y: targetY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isGyroActiveRef.current) return;
      updateFromClientXY(e.clientX, e.clientY);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (isGyroActiveRef.current) return;
      const target = e.target as HTMLElement | null;
      if (target && target.closest("button, a")) return;
      if (e.touches.length > 0) {
        updateFromClientXY(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isGyroActiveRef.current) return;
      if (e.touches.length > 0) {
        updateFromClientXY(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onScroll = () => {
      lastScrollTimeRef.current = performance.now();
      gazeTargetTimerRef.current = { target: null, start: 0, fired: false };
      if (isGyroActiveRef.current) return;
      updateFromClientXY(lastClientPos.x, lastClientPos.y);
    };

    const onMouseLeave = (e: MouseEvent) => {
      if (isGyroActiveRef.current) return;
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
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onTouchStart);
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
    </div>
  );
}

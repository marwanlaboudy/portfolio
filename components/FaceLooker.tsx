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

  // 2D Face refs
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const blinkImagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const smoothCoordRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isCursorOnFaceRef = useRef<boolean>(true);
  const animFrameIdRef = useRef<number | null>(null);
  const lastDrawnKeyRef = useRef<string | null>(null);

  // 3D Character & Progressive Piece-by-Piece Assembly refs
  const threeSceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    pivot: THREE.Group | null;
    wireframePivot: THREE.Group | null;
    clipPlane: THREE.Plane;
    wireframeClipPlane: THREE.Plane;
    seamMesh: THREE.Mesh;
    seamMat: THREE.MeshBasicMaterial;
    wireframeMat: THREE.MeshBasicMaterial;
    isModelLoaded: boolean;
  } | null>(null);

  // Blend factor: 0 = face only, 0 -> 1 = mask assembling piece-by-piece onto face, 1 = fully worn
  const charBlendRef = useRef<number>(0);

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

  // 1. Initialize Three.js Scene with Local Clipping for Progressive Piece-by-Piece Donning
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
    renderer.setSize(size, size);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // Enable local clipping planes for progressive slicing assembly
    renderer.localClippingEnabled = true;

    // Clipping plane for the solid mask plates
    const clipPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -2.5);

    // Clipping plane for the holographic wireframe preview that descends ahead of the solid plate
    const wireframeClipPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -2.5);

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

    // Seam Laser Glow Mesh: visual cybernetic edge separating masked area from face
    const seamGeo = new THREE.PlaneGeometry(3.2, 0.035);
    const seamMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const seamMesh = new THREE.Mesh(seamGeo, seamMat);
    seamMesh.visible = false;
    scene.add(seamMesh);

    // Shared wireframe material for the holographic ghost slice
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0,
      clippingPlanes: [wireframeClipPlane],
    });

    const sceneState = {
      scene,
      camera,
      renderer,
      pivot: null as THREE.Group | null,
      wireframePivot: null as THREE.Group | null,
      clipPlane,
      wireframeClipPlane,
      seamMesh,
      seamMat,
      wireframeMat,
      isModelLoaded: false,
    };
    threeSceneRef.current = sceneState;

    // Load 3D Mask GLB
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
        scene.add(pivot);

        // 2. Holographic Wireframe Clone (floating ghost slice assembling ahead of the mask)
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

  // 3. 60fps/120fps Render Loop: Progressive Slicing Assembly ("Wearing it Piece by Piece")
  const renderFrame = useCallback(() => {
    // Smooth lerp coordinates
    const lerpFactor = 0.22;
    smoothCoordRef.current.x +=
      (mouseTargetRef.current.x - smoothCoordRef.current.x) * lerpFactor;
    smoothCoordRef.current.y +=
      (mouseTargetRef.current.y - smoothCoordRef.current.y) * lerpFactor;

    const sx = smoothCoordRef.current.x;
    const sy = smoothCoordRef.current.y;

    // ------------------------------------------------------------------------
    // PIECE-BY-PIECE ASSEMBLY LOGIC:
    // In the middle (|sx| <= 0.16): blend = 0 (100% natural face).
    // As you look right or left (|sx| > 0.16):
    // blend progresses from 0 -> 1:
    // - blend ~0.20: Top forehead slice appears across brow (matching the reference photo!).
    // - blend ~0.50: Mask covers down past the eyes & bridge of nose.
    // - blend ~0.80: Mask latches over mouth down to chin.
    // - blend ~1.00: Mask is completely locked in place.
    // ------------------------------------------------------------------------
    const isModelReady = threeSceneRef.current?.isModelLoaded ?? false;
    let targetBlend = 0;

    if (isModelReady && !isCursorOnFaceRef.current) {
      const sideDistance = Math.abs(sx);
      const startThreshold = 0.16;
      const fullThreshold = 0.58;

      if (sideDistance > startThreshold) {
        targetBlend = Math.min(1, (sideDistance - startThreshold) / (fullThreshold - startThreshold));
      }
    }

    // Smooth spring-like lerp for organic mechanical donning
    charBlendRef.current += (targetBlend - charBlendRef.current) * 0.14;
    const blend = charBlendRef.current;

    // ------------------------------------------------------------------------
    // Dynamic Face Visibility:
    // Your face stays 100% visible beneath the unmasked areas!
    // It only gently fades out when the mask has 92%+ completely covered the face.
    // ------------------------------------------------------------------------
    if (faceCanvasRef.current) {
      const faceOpacity = blend < 0.90 ? 1 : Math.max(0, (1 - blend) / 0.10);
      faceCanvasRef.current.style.opacity = faceOpacity.toFixed(3);
    }

    // Render 2D Face frames
    if (blend < 0.98 && manifest) {
      const blinkCount = manifest.blinkFrames?.length ?? 0;

      if (
        isCursorOnFaceRef.current &&
        blinkCount > 0 &&
        blinkImagesRef.current.size > 0
      ) {
        smoothCoordRef.current.x = 0;
        smoothCoordRef.current.y = 0;

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
    // Render 3D Piece-by-Piece Mask Assembly
    // ------------------------------------------------------------------------
    if (threeSceneRef.current) {
      const {
        scene,
        camera,
        renderer,
        pivot,
        wireframePivot,
        clipPlane,
        wireframeClipPlane,
        seamMesh,
        seamMat,
        wireframeMat,
      } = threeSceneRef.current;

      if (pivot && wireframePivot) {
        // Look tracking
        pivot.rotation.y = sx * 1.15;
        pivot.rotation.x = -sy * 0.45;
        pivot.rotation.z = -sx * 0.12;

        const breath = Math.sin(performance.now() * 0.0028) * 0.025;
        pivot.position.x = sx * 0.15;
        pivot.position.y = -sy * 0.12 + breath;

        wireframePivot.rotation.copy(pivot.rotation);
        wireframePivot.position.copy(pivot.position);

        if (blend > 0.002) {
          // Dynamic angled cut matching the reference picture:
          // Slices diagonally across forehead depending on looking right vs left!
          const tiltX = sx >= 0 ? -0.26 : 0.26;
          const planeNormal = new THREE.Vector3(tiltX, 1, 0).normalize();

          clipPlane.normal.copy(planeNormal);

          // Progressive slice height constant:
          // -1.55 = above forehead (nothing visible)
          // -0.85 = top forehead band visible (matching reference photo!)
          // +0.10 = down to eyes & bridge of nose
          // +1.10 = down to mouth & chin
          // +1.80 = fully assembled
          const clipConstant = -1.55 + blend * 3.35;
          clipPlane.constant = clipConstant;

          // Holographic wireframe leads ahead of the solid plate
          wireframeClipPlane.normal.copy(planeNormal);
          wireframeClipPlane.constant = clipConstant + 0.48;
          wireframePivot.position.y += (1 - blend) * 0.18; // descends from above
          wireframeMat.opacity = Math.max(0, Math.sin(blend * Math.PI) * 0.45);

          // Glowing Cybernetic Seam Laser along the cutting edge
          const seamY = -clipConstant / planeNormal.y;
          seamMesh.position.set(pivot.position.x, seamY + pivot.position.y, 0.55);
          seamMesh.rotation.z = Math.atan2(planeNormal.x, planeNormal.y);
          seamMesh.visible = blend > 0.04 && blend < 0.94;
          seamMat.opacity = Math.sin(blend * Math.PI) * 0.9;
          seamMat.color.setHex(sx >= 0 ? 0x22d3ee : 0xec4899);

          renderer.render(scene, camera);
        } else {
          // In center / neutral: mask is retracted above forehead
          clipPlane.constant = -3.0;
          wireframeClipPlane.constant = -3.0;
          seamMesh.visible = false;
          renderer.clear();
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

  // 4. Cursor, Touch & Scroll Tracking
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

      // Face bounding radius
      const faceRadiusX = rect.width * 0.20;
      const faceRadiusY = rect.height * 0.26;
      const normFaceDist =
        (deltaX / faceRadiusX) ** 2 + (deltaY / faceRadiusY) ** 2;

      // 1. When cursor is on the face: lock face in the center and keep blinking
      if (normFaceDist <= 1.0 && scrollRatio < 0.05) {
        isCursorOnFaceRef.current = true;
        mouseTargetRef.current = { x: 0, y: 0 };
        return;
      }

      isCursorOnFaceRef.current = false;

      // 2. Off-face cursor tracking
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
      {/* 2D Real Face Canvas: Always active underneath, visible through unmasked areas */}
      <canvas
        ref={faceCanvasRef}
        width={size}
        height={size}
        className="absolute inset-0 block h-full w-full select-none pointer-events-none drop-shadow-[-16px_0_36px_rgba(126,232,255,0.22)] drop-shadow-[16px_0_36px_rgba(255,47,185,0.25)] will-change-transform"
      />

      {/* 3D Mask Canvas: Physically assembles piece-by-piece over the face */}
      <canvas
        ref={threeCanvasRef}
        width={size}
        height={size}
        className="absolute inset-0 block h-full w-full select-none pointer-events-none drop-shadow-[-16px_0_36px_rgba(126,232,255,0.28)] drop-shadow-[16px_0_36px_rgba(255,47,185,0.32)] will-change-transform"
      />
    </div>
  );
}

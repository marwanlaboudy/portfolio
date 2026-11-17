"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useVelocity,
  useMotionValue,
} from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Bot,
  Brain,
  CheckCircle2,
  Cpu,
  ExternalLink,
  MessageSquare,
  ShoppingBag,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";

// ============================================================================
// 1. 3D TILT GLASS CARD COMPONENT
// ============================================================================
function TiltCard({
  children,
  className = "",
  glowColor = "cyan",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: "cyan" | "magenta";
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 300, damping: 25 });
  const springY = useSpring(y, { stiffness: 300, damping: 25 });

  const rotateX = useTransform(springY, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const glowShadow =
    glowColor === "cyan"
      ? "hover:shadow-[0_0_60px_rgba(34,211,238,0.3)] hover:border-[#22d3ee]/90"
      : "hover:shadow-[0_0_60px_rgba(236,72,153,0.3)] hover:border-[#ec4899]/90";

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative rounded-[32px] border border-white/10 bg-[#07070a]/90 backdrop-blur-2xl transition-colors duration-300 ${glowShadow} ${className}`}
    >
      <div style={{ transform: "translateZ(30px)" }}>{children}</div>
    </motion.div>
  );
}

// ============================================================================
// 2. VELOCITY-REACTIVE sEMG MUSCLE WAVEFORM (Spikes intensely on fast scroll)
// ============================================================================
function VelocityReactiveSemg({
  velocityValue,
}: {
  velocityValue: any;
}) {
  const [frameTick, setFrameTick] = useState(0);

  // Velocity-driven amplitude spike factor
  const rawSpike = useTransform(velocityValue, [-3500, 0, 3500], [3.2, 0.8, 3.2]);
  const smoothSpike = useSpring(rawSpike, { stiffness: 320, damping: 24 });

  useEffect(() => {
    let animId: number;
    const loop = () => {
      setFrameTick((t) => (t + 1) % 1000);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const generateWaveform = () => {
    const points: string[] = [];
    const width = 560;
    const midY = 60;

    for (let x = 0; x <= width; x += 4) {
      const phase = (x * 0.05 - frameTick * 0.15) % (Math.PI * 2);
      const burstWindow = Math.sin(x * 0.02 - frameTick * 0.05);
      const isBurst = burstWindow > 0.4;
      const spike = isBurst ? Math.pow(burstWindow, 3) * 36 : 4;
      const noise = (Math.sin(phase * 4.2) + Math.cos(phase * 7.9)) * 3;
      const y = midY + Math.sin(phase * 9.0) * spike + noise;
      points.push(`${x === 0 ? "M" : "L"} ${x} ${y.toFixed(1)}`);
    }
    return points.join(" ");
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#22d3ee]/30 bg-[#07070a]/95 p-4 shadow-[0_0_35px_rgba(34,211,238,0.18)]">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="text-white/80 uppercase tracking-widest">
            Kiwi Band // Forearm sEMG Waveform
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#ec4899] font-bold">1 kHz Sampling</span>
          <span className="text-[#22d3ee] font-bold">Velocity Synced</span>
        </div>
      </div>

      <div className="relative mt-3 h-36 w-full overflow-hidden rounded-xl bg-black/90 flex items-center justify-center">
        {/* Background scope grid */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:18px_18px] opacity-15" />

        {/* Dynamic ScaleY linked to velocity */}
        <motion.div
          style={{ scaleY: smoothSpike }}
          className="relative w-full h-full flex items-center justify-center origin-center"
        >
          <svg
            viewBox="0 0 560 120"
            className="w-full h-full block"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="velocitySemgGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <path
              d={generateWaveform()}
              fill="none"
              stroke="url(#velocitySemgGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="drop-shadow(0 0 8px #22d3ee)"
            />
          </svg>
        </motion.div>

        {/* Live classifier badge */}
        <div className="absolute top-2 right-2 flex items-center gap-2 rounded-lg border border-[#ec4899]/40 bg-black/85 px-2.5 py-1 backdrop-blur-md">
          <Zap className="h-3 w-3 text-[#ec4899]" />
          <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
            [ PINCH_INDEX ]
          </span>
          <span className="rounded bg-[#ec4899]/20 px-1.5 py-0.5 text-[9px] font-mono text-[#ec4899]">
            99.4%
          </span>
        </div>

        <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[9px] font-mono text-white/50">
          <span>Range: ±180 µV</span>
          <span className="text-emerald-400">Velocity Reaction: ACTIVE</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT: KINETIC SIGNAL TRACE (Wide S-Curve, Parallax & Velocity)
// ============================================================================
export default function KineticSignalTrace() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  // 1. Scroll Position & Velocity Tracking
  const { scrollY, scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 45, stiffness: 350 });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 42,
    restDelta: 0.001,
  });

  // 2. Wide S-Curve SVG Circuit Path
  // Coordinates sweep across a 1200 x 2400 canvas in dramatic arcs
  const svgPathD =
    "M 600,0 C 980,240 1140,560 840,880 C 520,1200 60,1480 380,1820 C 660,2120 1020,2240 600,2400";

  // Coordinates for tip-riding glowing orb calculated along the S-curve
  const orbX = useTransform(
    smoothProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ["50%", "78%", "32%", "72%", "50%"]
  );
  const orbY = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  // 3. Kinetic Typography Horizontal Scrub (Word-by-word parallax like Lando Norris)
  const kineticWord1X = useTransform(smoothProgress, [0.1, 0.6], ["-25%", "25%"]);
  const kineticWord2X = useTransform(smoothProgress, [0.1, 0.6], ["25%", "-25%"]);

  // 4. Staggered Scroll-Driven Depth Parallax for Cards:
  // Re-Sapori glides at 1.2x speed upward; Mario Juice glides at 0.85x speed with tilt
  const reSaporiY = useTransform(smoothProgress, [0.15, 0.65], [160, -160]);
  const marioJuiceY = useTransform(smoothProgress, [0.15, 0.65], [320, -60]);
  const marioJuiceRotate = useTransform(smoothProgress, [0.15, 0.65], [-3, 1.5]);

  // Mask wipes for smooth unveil
  const cardClipPath = useTransform(
    smoothProgress,
    [0.12, 0.32],
    ["inset(80% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
  );

  return (
    <section
      ref={sectionRef}
      id="signal-trace"
      className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 py-28 sm:py-40 overflow-hidden"
    >
      {/* Background Wide S-Curve SVG Circuit Track */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="h-full w-full opacity-60"
          viewBox="0 0 1200 2400"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="scurveGrad" x1="0" y1="0" x2="0" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="40%" stopColor="#ec4899" />
              <stop offset="70%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>

            <filter id="circuitNeonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Faint blueprint background path */}
          <path
            d={svgPathD}
            fill="none"
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth="3.5"
            strokeDasharray="6 8"
          />

          {/* Dynamic drawing S-curve path */}
          <motion.path
            ref={pathRef}
            d={svgPathD}
            fill="none"
            stroke="url(#scurveGrad)"
            strokeWidth="4"
            filter="url(#circuitNeonGlow)"
            style={{ pathLength: smoothProgress }}
          />
        </svg>

        {/* Glowing tip-riding photon orb */}
        <motion.div
          style={{
            left: orbX,
            top: orbY,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
        >
          <span className="h-6 w-6 rounded-full bg-[#22d3ee] shadow-[0_0_25px_#22d3ee,0_0_45px_#ec4899] animate-pulse" />
          <span className="absolute h-10 w-10 rounded-full border border-[#ec4899] opacity-75 animate-ping" />
        </motion.div>
      </div>

      {/* Kinetic Typography Section Header (Scrubbed Horizontally) */}
      <div className="mb-24 flex flex-col items-start gap-4 overflow-hidden">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-[#22d3ee]/40 bg-[#22d3ee]/10 px-4 py-1.5 text-[10px] font-mono uppercase tracking-[0.35em] text-[#22d3ee] backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.2)]">
          <Activity className="h-3 w-3 text-[#ec4899] animate-pulse" />
          <span className="font-extrabold">// 01. SIGNAL TRACE CIRCUIT</span>
          <span className="text-white/40">|</span>
          <span className="text-[#ec4899] font-bold">CHOREOGRAPHED PARALLAX</span>
        </div>

        <div className="overflow-hidden py-2">
          <motion.h2
            style={{ x: kineticWord1X }}
            className="text-4xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tight text-white select-none whitespace-nowrap"
          >
            INTERACTIVE{" "}
            <span className="text-[#22d3ee] drop-shadow-[0_0_40px_rgba(34,211,238,0.5)]">
              SIGNAL
            </span>
          </motion.h2>
        </div>

        <div className="overflow-hidden py-1">
          <motion.h2
            style={{ x: kineticWord2X }}
            className="text-4xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tight text-white select-none whitespace-nowrap"
          >
            CIRCUIT &{" "}
            <span className="text-[#ec4899] italic drop-shadow-[0_0_40px_rgba(236,72,153,0.6)]">
              TELEMETRY
            </span>
          </motion.h2>
        </div>

        <p className="max-w-2xl text-[13px] sm:text-[15px] leading-relaxed tracking-wider text-white/70">
          Scroll progress physically drives the layout: sweeping SVG circuit traces, staggered card parallax, and velocity-linked neuromuscular waveforms.
        </p>
      </div>

      {/* ==================================================================== */}
      {/* CHECKPOINT 01: Web & Brand Engineering (Parallax Stagger + Mask Wipe) */}
      {/* ==================================================================== */}
      <div className="relative mb-36 lg:mb-48">
        <div className="flex items-center gap-3 mb-8">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee] shadow-[0_0_15px_#22d3ee]">
            <span className="text-[11px] font-mono font-bold">01</span>
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#22d3ee] font-bold">
              CHECKPOINT 01 // PARALLAX DEPTH STAGGER
            </span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              Web & Brand Engineering
            </h3>
          </div>
        </div>

        {/* Staggered Vertical Parallax Grid (Re-Sapori @ 1.2x speed, Mario Juice @ 0.85x speed) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Card A: Re-Sapori (Glides faster upward) */}
          <motion.div
            style={{
              y: reSaporiY,
              clipPath: cardClipPath,
            }}
          >
            <TiltCard glowColor="cyan" className="p-8 sm:p-10">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#22d3ee]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  Live Production Storefront
                </span>
                <span className="text-[10px] font-mono text-white/50">Next.js 16 + React 19</span>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/85 shadow-2xl">
                <div className="flex items-center justify-between bg-white/[0.04] px-4 py-2 border-b border-white/10 text-[10px] font-mono text-white/60">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500/70" />
                    <span className="h-2 w-2 rounded-full bg-yellow-500/70" />
                    <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
                  </div>
                  <span className="truncate text-[#22d3ee]">https://resapori.com</span>
                  <ExternalLink className="h-3 w-3 text-white/40" />
                </div>
                <div className="p-5 flex flex-col gap-2.5 bg-gradient-to-br from-[#0c0c16] to-black">
                  <h4 className="text-2xl font-black uppercase text-white tracking-tight">
                    Re-Sapori
                  </h4>
                  <p className="text-[13px] leading-relaxed text-white/70">
                    Italian culinary web platform engineered with Next.js 16 App Router, Turbopack, real-time table reservations, and fluid kinetic transitions.
                  </p>
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase text-white/60 pt-2">
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">Turbopack</span>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">SSR Next.js</span>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">Tailwind</span>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">Framer Motion</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <a
                  href="https://resapori.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#22d3ee] to-[#38bdf8] px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all hover:scale-105 active:scale-95"
                >
                  <span>Launch Site</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <span className="text-[10px] font-mono text-white/40">1.2x Parallax Speed</span>
              </div>
            </TiltCard>
          </motion.div>

          {/* Card B: Mario Juice (Glides slower with scroll-linked rotation) */}
          <motion.div
            style={{
              y: marioJuiceY,
              rotate: marioJuiceRotate,
              clipPath: cardClipPath,
            }}
          >
            <TiltCard glowColor="magenta" className="p-8 sm:p-10">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#ec4899]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  Live Beverage Storefront
                </span>
                <span className="text-[10px] font-mono text-white/50">Mobile-First UI</span>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/85 shadow-2xl">
                <div className="flex items-center justify-between bg-white/[0.04] px-4 py-2 border-b border-white/10 text-[10px] font-mono text-white/60">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500/70" />
                    <span className="h-2 w-2 rounded-full bg-yellow-500/70" />
                    <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
                  </div>
                  <span className="truncate text-[#ec4899]">https://mariojuice.com</span>
                  <ExternalLink className="h-3 w-3 text-white/40" />
                </div>
                <div className="p-5 flex flex-col gap-2.5 bg-gradient-to-br from-[#0c0c16] to-black">
                  <h4 className="text-2xl font-black uppercase text-white tracking-tight">
                    Mario Juice
                  </h4>
                  <p className="text-[13px] leading-relaxed text-white/70">
                    High-conversion brand storefront with vibrant color theory, reactive menu filtering, instant cart UX, and mobile-first responsive architecture.
                  </p>
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase text-white/60 pt-2">
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">Fast Cart UX</span>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">Brand Identity</span>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">Responsive</span>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">Sub-Second TTFB</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <a
                  href="https://mariojuice.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ec4899] to-[#f43f5e] px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all hover:scale-105 active:scale-95"
                >
                  <span>Launch Site</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <span className="text-[10px] font-mono text-white/40">0.85x Parallax + Rotation</span>
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CHECKPOINT 02: Automation & AI Systems (Live Photon Data Stream)      */}
      {/* ==================================================================== */}
      <div className="relative mb-36 lg:mb-48">
        <div className="flex items-center gap-3 mb-8">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ec4899] bg-[#ec4899]/20 text-[#ec4899] shadow-[0_0_15px_#ec4899]">
            <span className="text-[11px] font-mono font-bold">02</span>
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ec4899] font-bold">
              CHECKPOINT 02 // STREAMING PHOTON PACKETS
            </span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              Automation & AI Systems
            </h3>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#0a0a14] via-[#07070a] to-black p-6 sm:p-10 backdrop-blur-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ec4899]">
                n8n Core • Shopify Hooks • WhatsApp Cloud API
              </span>
              <p className="mt-1 text-sm text-white/70 max-w-2xl">
                Asynchronous event pipelines connecting Shopify order streams with fine-tuned Qwen3.5 and AraBERT NLP conversational agents.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-mono text-emerald-300 shrink-0">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Pipeline Latency: &lt; 85ms</span>
            </div>
          </div>

          {/* Animated Connecting Nodes */}
          <div className="relative my-8 p-6 rounded-2xl bg-black/70 border border-white/10 overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="flex flex-col items-center text-center p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] mb-2">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  SHOPIFY
                </span>
                <span className="text-[9px] font-mono text-white/50 mt-1">
                  Order Ingestion & Catalog Webhook
                </span>
              </div>

              <div className="flex flex-col items-center text-center p-5 rounded-2xl border border-[#ec4899]/50 bg-[#ec4899]/10 backdrop-blur-md shadow-[0_0_25px_rgba(236,72,153,0.2)]">
                <div className="h-12 w-12 rounded-xl bg-[#ec4899]/30 border border-[#ec4899] flex items-center justify-center text-[#ec4899] shadow-[0_0_20px_#ec4899] mb-2">
                  <Workflow className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  N8N CORE
                </span>
                <span className="text-[9px] font-mono text-[#ec4899] mt-1">
                  Async Router & Qwen3.5 Inference
                </span>
              </div>

              <div className="flex flex-col items-center text-center p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
                <div className="h-12 w-12 rounded-xl bg-[#22d3ee]/20 border border-[#22d3ee]/40 flex items-center justify-center text-[#22d3ee] shadow-[0_0_15px_rgba(34,211,238,0.3)] mb-2">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  WHATSAPP
                </span>
                <span className="text-[9px] font-mono text-[#22d3ee] mt-1">
                  AraBERT Multi-Dialect Response
                </span>
              </div>
            </div>

            {/* Traveling Photon Data Packets */}
            <div className="relative mt-8 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-[10px] font-mono text-white/50 mb-2">
                <span className="flex items-center gap-1.5 text-[#22d3ee]">
                  <Zap className="h-3 w-3" />
                  LIVE PHOTON STREAM: payload.order.json [2.1 KB]
                </span>
                <span>EXECUTION: 100% AUTONOMOUS</span>
              </div>

              <div className="relative h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.8,
                    ease: "linear",
                  }}
                  className="h-full w-48 rounded-full bg-gradient-to-r from-transparent via-[#22d3ee] to-transparent shadow-[0_0_14px_#22d3ee]"
                />
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.8,
                    delay: 0.9,
                    ease: "linear",
                  }}
                  className="h-full w-36 rounded-full bg-gradient-to-r from-transparent via-[#ec4899] to-transparent shadow-[0_0_14px_#ec4899]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CHECKPOINT 03: Hardware & Edge ML (Velocity-Reactive sEMG Waveform)  */}
      {/* ==================================================================== */}
      <div className="relative mb-20">
        <div className="flex items-center gap-3 mb-8">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee] shadow-[0_0_15px_#22d3ee]">
            <span className="text-[11px] font-mono font-bold">03</span>
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#22d3ee] font-bold">
              CHECKPOINT 03 // VELOCITY-LINKED sEMG SPIKES
            </span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              Hardware & Edge ML // Kiwi Band
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Velocity-Reactive sEMG Waveform */}
          <div className="lg:col-span-7">
            <VelocityReactiveSemg velocityValue={smoothVelocity} />
          </div>

          {/* Right: Hardware Telemetry HUD */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c0c16] to-[#07070a] p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#22d3ee]">
                  Neural Sensor Telemetry
                </span>
                <span className="rounded-full bg-[#22d3ee]/10 border border-[#22d3ee]/30 px-2 py-0.5 text-[9px] font-mono text-[#22d3ee]">
                  ESP32-S3 Core
                </span>
              </div>

              <h4 className="text-xl font-bold text-white mt-3 uppercase tracking-tight">
                Kiwi Band
              </h4>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#ec4899] mt-0.5 font-bold">
                ESP32 + sEMG Muscle Sensor + 6-Axis IMU
              </p>

              <p className="mt-2.5 text-[13px] leading-relaxed text-white/70">
                Wearable neural-interface prototype acquiring micro-voltage surface electromyography from forearm muscles paired with 6-axis IMU tracking for sub-14ms gesture inference.
              </p>

              <div className="mt-4 space-y-2 text-[11px] font-mono text-white/80">
                <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <span className="text-white/60">Processor:</span>
                  <span className="text-[#22d3ee] font-bold">ESP32-S3 Dual-Core</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <span className="text-white/60">Muscle Front-End:</span>
                  <span className="text-[#ec4899] font-bold">Differential sEMG (1 kHz)</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <span className="text-white/60">Motion Tracking:</span>
                  <span className="text-white font-bold">6-Axis IMU (200 Hz)</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <span className="text-white/60">Edge ML Model:</span>
                  <span className="text-emerald-400 font-bold">Quantized 1D-CNN</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-[10px] font-mono">
              <span className="uppercase tracking-widest text-[#ec4899] font-bold">
                Velocity Feedback Active
              </span>
              <p className="mt-1 text-white/60 leading-relaxed">
                Scroll faster to see the sEMG muscle potential amplitude spike violently with physiological firing bursts, settling smoothly when you pause.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

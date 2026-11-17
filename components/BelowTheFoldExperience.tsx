"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Bot,
  Brain,
  CheckCircle2,
  ChevronRight,
  CircuitBoard,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  Layers,
  MessageSquare,
  Network,
  Radio,
  RefreshCw,
  Share2,
  ShoppingBag,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";

// ============================================================================
// 1. 3D CURSOR-TILTING GLASSMORPHIC CARD (Node 01: Re-Sapori & Mario Juice)
// ============================================================================
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "cyan" | "magenta";
}

function TiltCard({
  children,
  className = "",
  glowColor = "cyan",
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["9deg", "-9deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-9deg", "9deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const glowShadow =
    glowColor === "cyan"
      ? "hover:shadow-[0_0_50px_rgba(34,211,238,0.28)] hover:border-[#22d3ee]/80"
      : "hover:shadow-[0_0_50px_rgba(236,72,153,0.28)] hover:border-[#ec4899]/80";

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
// 2. LIVE DYNAMIC sEMG WAVEFORM (Amplitude spikes with scroll)
// ============================================================================
function DynamicSemgWaveform({ scrollScale }: { scrollScale: any }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      setTick((t) => (t + 1) % 1000);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Generate dynamic sEMG waveform points simulating neuromuscular firing bursts
  const generateWavePath = () => {
    const points: string[] = [];
    const width = 560;
    const midY = 60;

    for (let xPos = 0; xPos <= width; xPos += 4) {
      const phase = (xPos * 0.05 - tick * 0.12) % (Math.PI * 2);
      // Neuromuscular spike burst simulation
      const burstWindow = Math.sin(xPos * 0.02 - tick * 0.04);
      const isBurst = burstWindow > 0.45;
      const spikeFactor = isBurst ? Math.pow(burstWindow, 3) * 36 : 4;
      const noise = (Math.sin(phase * 4.3) + Math.cos(phase * 7.7)) * 3;
      const rawY =
        midY + Math.sin(phase * 9.0) * spikeFactor + noise;
      points.push(`${xPos === 0 ? "M" : "L"} ${xPos} ${rawY.toFixed(1)}`);
    }
    return points.join(" ");
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#22d3ee]/30 bg-[#07070a]/95 p-4 shadow-[0_0_35px_rgba(34,211,238,0.18)]">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="text-white/80 uppercase tracking-widest">
            sEMG Telemetry: Forearm Muscle Voltage
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#ec4899] font-bold">1 kHz / 24-bit ADC</span>
          <span className="text-[#22d3ee] font-bold">BLE 5.2</span>
        </div>
      </div>

      {/* Dynamic Waveform SVG with vertical scaleY spiking on scroll */}
      <div className="relative mt-3 h-32 w-full overflow-hidden rounded-xl bg-black/90 flex items-center justify-center">
        {/* Background scope grid */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:18px_18px] opacity-15" />

        <motion.div
          style={{ scaleY: scrollScale }}
          className="relative w-full h-full flex items-center justify-center origin-center"
        >
          <svg
            viewBox="0 0 560 120"
            className="w-full h-full block"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="semgGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <path
              d={generateWavePath()}
              fill="none"
              stroke="url(#semgGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="drop-shadow(0 0 6px #22d3ee)"
            />
          </svg>
        </motion.div>

        {/* Dynamic classifier overlay */}
        <div className="absolute top-2 right-2 flex items-center gap-2 rounded-lg border border-[#ec4899]/40 bg-black/85 px-2.5 py-1 backdrop-blur-md">
          <Zap className="h-3 w-3 text-[#ec4899]" />
          <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
            [ PINCH_INDEX ]
          </span>
          <span className="rounded bg-[#ec4899]/20 px-1.5 py-0.5 text-[9px] font-mono text-[#ec4899]">
            99.2%
          </span>
        </div>

        <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[9px] font-mono text-white/50">
          <span>Range: ±180 µV</span>
          <span className="text-emerald-400">Gesture Spike: ACTIVE</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. MAGNETIC CURSOR-FOLLOWING "AVAILABLE FOR WORK" BUTTON
// ============================================================================
function MagneticButton() {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 240, damping: 18 });
  const springY = useSpring(y, { stiffness: 240, damping: 18 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;

    x.set(distX * 0.35);
    y.set(distY * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={btnRef}
      href="mailto:contact@example.com"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="group relative inline-flex items-center gap-3 rounded-full border-2 border-[#07070a] bg-[#07070a] px-8 py-4 text-xs font-mono font-black uppercase tracking-[0.28em] text-white shadow-[0_0_40px_rgba(7,7,10,0.5)] transition-all duration-300 hover:scale-105 hover:bg-white hover:text-[#07070a] hover:border-white active:scale-95"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
      </span>
      <span>AVAILABLE FOR WORK</span>
      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
    </motion.a>
  );
}

// ============================================================================
// MAIN EXPORT: 3 COHESIVE BELOW-THE-FOLD SCROLL SECTIONS
// ============================================================================
export default function BelowTheFoldExperience() {
  // 1. Signal Trace section scroll refs & transforms
  const signalRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: signalScroll } = useScroll({
    target: signalRef,
    offset: ["start 80%", "end 50%"],
  });

  const smoothSignalPath = useSpring(signalScroll, {
    stiffness: 280,
    damping: 45,
    restDelta: 0.001,
  });

  // Dynamic muscle-potential waveform amplitude that spikes during Node 03
  const rawWaveformSpike = useTransform(
    signalScroll,
    [0.6, 0.85, 1.0],
    [0.7, 2.35, 0.9]
  );
  const smoothWaveformScale = useSpring(rawWaveformSpike, {
    stiffness: 260,
    damping: 25,
  });

  // Node checkpoint active states based on scroll
  const [activeSignalNode, setActiveSignalNode] = useState(1);
  useEffect(() => {
    return signalScroll.on("change", (v) => {
      if (v < 0.38) setActiveSignalNode(1);
      else if (v < 0.72) setActiveSignalNode(2);
      else setActiveSignalNode(3);
    });
  }, [signalScroll]);

  // 2. Horizontal Deck scroll refs & transforms
  const deckRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: deckScroll } = useScroll({
    target: deckRef,
    offset: ["start start", "end end"],
  });

  // Horizontal card deck translation (0% to -72%)
  const rawDeckX = useTransform(deckScroll, [0, 1], ["4%", "-68%"]);
  const smoothDeckX = useSpring(rawDeckX, {
    stiffness: 220,
    damping: 38,
  });

  // Opposite half-speed parallax watermark
  const watermarkX = useTransform(deckScroll, [0, 1], ["0%", "28%"]);

  return (
    <div className="relative z-10 w-full overflow-hidden bg-[#07070a] text-white">
      {/* ==================================================================== */}
      {/* SECTION 1: INTERACTIVE "SIGNAL TRACE" SVG CIRCUIT (Scroll 25% -> 75%) */}
      {/* ==================================================================== */}
      <section
        ref={signalRef}
        id="signal-trace"
        className="relative mx-auto max-w-7xl px-4 sm:px-6 py-28 sm:py-36 overflow-hidden"
      >
        {/* Ambient neon glow backdrops */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-1/4 -left-48 h-[600px] w-[600px] rounded-full bg-[#22d3ee]/10 blur-[180px]" />
          <div className="absolute top-2/3 -right-48 h-[600px] w-[600px] rounded-full bg-[#ec4899]/12 blur-[180px]" />
        </div>

        {/* Section Header */}
        <div className="mb-20 flex flex-col items-start gap-4">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#22d3ee]/40 bg-[#22d3ee]/10 px-4 py-1.5 text-[10px] font-mono uppercase tracking-[0.35em] text-[#22d3ee] backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <Activity className="h-3 w-3 text-[#ec4899] animate-pulse" />
            <span className="font-extrabold">// 01. SIGNAL TRACE CIRCUIT</span>
            <span className="text-white/40">|</span>
            <span className="text-[#ec4899] font-bold">25% → 75% PROGRESS</span>
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white">
            INTERACTIVE{" "}
            <span className="text-[#ec4899] italic drop-shadow-[0_0_40px_rgba(236,72,153,0.6)]">
              SIGNAL TRACE
            </span>
          </h2>

          <p className="max-w-2xl text-[13px] sm:text-[15px] leading-relaxed tracking-wider text-white/70">
            A live neon circuit weaving through three interactive checkpoints: full-stack production storefronts, automated NLP agent pipelines, and wearable edge ML hardware.
          </p>
        </div>

        {/* SVG Circuit Line Container */}
        <div className="relative">
          {/* Central Vertical SVG Circuit Trace */}
          <div className="pointer-events-none absolute left-6 lg:left-1/2 top-0 bottom-0 -translate-x-1/2 w-12 hidden sm:block z-0">
            <svg
              className="h-full w-full"
              preserveAspectRatio="none"
              viewBox="0 0 40 1000"
            >
              <defs>
                <linearGradient id="circuitGrad" x1="0" y1="0" x2="0" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="45%" stopColor="#ec4899" />
                  <stop offset="75%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>

                <filter
                  id="neonCircuitGlow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Inactive blueprint circuit track */}
              <path
                d="M 20 0 L 20 280 Q 20 310 32 330 T 20 380 L 20 620 Q 20 650 8 670 T 20 720 L 20 860 L 28 875 L 12 890 L 30 905 L 10 920 L 20 935 L 20 1000"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="2.5"
                strokeDasharray="4 6"
              />

              {/* Active progressive neon signal trace */}
              <motion.path
                d="M 20 0 L 20 280 Q 20 310 32 330 T 20 380 L 20 620 Q 20 650 8 670 T 20 720 L 20 860 L 28 875 L 12 890 L 30 905 L 10 920 L 20 935 L 20 1000"
                fill="none"
                stroke="url(#circuitGrad)"
                strokeWidth="3.5"
                filter="url(#neonCircuitGlow)"
                style={{ pathLength: smoothSignalPath }}
              />
            </svg>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* NODE 01: Web & Brand Engineering (Re-Sapori & Mario Juice)     */}
          {/* -------------------------------------------------------------- */}
          <div className="relative z-10 mb-28 lg:mb-36">
            <div className="flex items-center gap-3 mb-6">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-500 ${
                  activeSignalNode >= 1
                    ? "border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee] shadow-[0_0_15px_#22d3ee]"
                    : "border-white/20 bg-white/5 text-white/40"
                }`}
              >
                <span className="text-[11px] font-mono font-bold">01</span>
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#22d3ee] font-bold">
                  CHECKPOINT 01 // SYNAPSE ACTIVE
                </span>
                <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                  Web & Brand Engineering
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Re-Sapori 3D Tilt Card */}
              <TiltCard glowColor="cyan" className="p-7 sm:p-9">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#22d3ee]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                    Live Production Storefront
                  </span>
                  <span className="text-[10px] font-mono text-white/50">Next.js 16 + React 19</span>
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/85 shadow-2xl">
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
                      Italian culinary platform engineered with Next.js 16 App Router, Turbopack, real-time dynamic menu browsing, and fluid kinetic transitions.
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
                  <span className="text-[10px] font-mono text-white/40">3D Tilt Active</span>
                </div>
              </TiltCard>

              {/* Mario Juice 3D Tilt Card */}
              <TiltCard glowColor="magenta" className="p-7 sm:p-9">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#ec4899]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                    Live Beverage Storefront
                  </span>
                  <span className="text-[10px] font-mono text-white/50">Mobile-First UI</span>
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/85 shadow-2xl">
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
                      High-conversion brand storefront with vibrant color theory, reactive menu filtering, instant cart UX, and cross-device optimization.
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
                  <span className="text-[10px] font-mono text-white/40">3D Tilt Active</span>
                </div>
              </TiltCard>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* NODE 02: Automation & AI Systems (n8n / Shopify / WhatsApp)    */}
          {/* -------------------------------------------------------------- */}
          <div className="relative z-10 mb-28 lg:mb-36">
            <div className="flex items-center gap-3 mb-6">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-500 ${
                  activeSignalNode >= 2
                    ? "border-[#ec4899] bg-[#ec4899]/20 text-[#ec4899] shadow-[0_0_15px_#ec4899]"
                    : "border-white/20 bg-white/5 text-white/40"
                }`}
              >
                <span className="text-[11px] font-mono font-bold">02</span>
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ec4899] font-bold">
                  CHECKPOINT 02 // DATA PACKETS STREAMING
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
                    Orchestrated Event Pipelines & Fine-Tuned NLP
                  </span>
                  <p className="mt-1 text-sm text-white/70 max-w-2xl">
                    Full-duplex event automation syncing Shopify order webhooks through n8n core with fine-tuned Qwen3.5 and AraBERT NLP conversational agents on WhatsApp.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-mono text-emerald-300 shrink-0">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Pipeline Latency: &lt; 85ms</span>
                </div>
              </div>

              {/* Animated Pipeline Diagram with Traveling Photon Data Packets */}
              <div className="relative my-8 p-6 rounded-2xl bg-black/70 border border-white/10 overflow-hidden">
                <div className="pointer-events-none absolute inset-0 opacity-15">
                  <div className="h-full w-full bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:16px_16px]" />
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Step 1: SHOPIFY */}
                  <div className="flex flex-col items-center text-center p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] mb-2">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      SHOPIFY
                    </span>
                    <span className="text-[9px] font-mono text-white/50 mt-1">
                      Event Ingestion & Order Webhook
                    </span>
                  </div>

                  {/* Step 2: N8N CORE */}
                  <div className="flex flex-col items-center text-center p-5 rounded-2xl border border-[#ec4899]/50 bg-[#ec4899]/10 backdrop-blur-md shadow-[0_0_25px_rgba(236,72,153,0.2)]">
                    <div className="h-12 w-12 rounded-xl bg-[#ec4899]/30 border border-[#ec4899] flex items-center justify-center text-[#ec4899] shadow-[0_0_20px_#ec4899] mb-2">
                      <Workflow className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      N8N CORE
                    </span>
                    <span className="text-[9px] font-mono text-[#ec4899] mt-1">
                      Async State Router & Transformations
                    </span>
                  </div>

                  {/* Step 3: WHATSAPP */}
                  <div className="flex flex-col items-center text-center p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
                    <div className="h-12 w-12 rounded-xl bg-[#22d3ee]/20 border border-[#22d3ee]/40 flex items-center justify-center text-[#22d3ee] shadow-[0_0_15px_rgba(34,211,238,0.3)] mb-2">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      WHATSAPP
                    </span>
                    <span className="text-[9px] font-mono text-[#22d3ee] mt-1">
                      Cloud API Dispatch & Live Engagement
                    </span>
                  </div>
                </div>

                {/* Traveling Photon Data Packet Line: SHOPIFY -> N8N -> WHATSAPP */}
                <div className="relative mt-8 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/50 mb-2">
                    <span className="flex items-center gap-1.5 text-[#22d3ee]">
                      <Zap className="h-3 w-3" />
                      LIVE PHOTON PACKET: payload.order.json [2.1 KB]
                    </span>
                    <span>NLP INFERENCE: Qwen3.5 + AraBERT</span>
                  </div>

                  {/* Pulsing visual track */}
                  <div className="relative h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.0,
                        ease: "linear",
                      }}
                      className="h-full w-48 rounded-full bg-gradient-to-r from-transparent via-[#22d3ee] to-transparent shadow-[0_0_12px_#22d3ee]"
                    />
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.0,
                        delay: 1.0,
                        ease: "linear",
                      }}
                      className="h-full w-36 rounded-full bg-gradient-to-r from-transparent via-[#ec4899] to-transparent shadow-[0_0_12px_#ec4899]"
                    />
                  </div>
                </div>
              </div>

              {/* NLP Fine-Tuning Metadata HUD */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <span className="text-lg font-black text-white">Qwen3.5</span>
                  <p className="text-[9px] text-white/50 mt-1 uppercase">Reasoning Engine</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <span className="text-lg font-black text-[#ec4899]">AraBERT</span>
                  <p className="text-[9px] text-white/50 mt-1 uppercase">Arabic Dialect NLP</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <span className="text-lg font-black text-[#22d3ee]">n8n & Webhooks</span>
                  <p className="text-[9px] text-white/50 mt-1 uppercase">Async Event Hub</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <span className="text-lg font-black text-emerald-400">99.9%</span>
                  <p className="text-[9px] text-white/50 mt-1 uppercase">Delivery SLA</p>
                </div>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* NODE 03: Hardware & Edge ML (Kiwi Band)                        */}
          {/* -------------------------------------------------------------- */}
          <div className="relative z-10 mb-20">
            <div className="flex items-center gap-3 mb-6">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-500 ${
                  activeSignalNode >= 3
                    ? "border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee] shadow-[0_0_15px_#22d3ee]"
                    : "border-white/20 bg-white/5 text-white/40"
                }`}
              >
                <span className="text-[11px] font-mono font-bold">03</span>
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#22d3ee] font-bold">
                  CHECKPOINT 03 // sEMG SPIKE TELEMETRY
                </span>
                <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                  Hardware & Edge ML // Kiwi Band
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Dynamic sEMG Waveform Monitor (spikes as user scrolls) */}
              <div className="lg:col-span-7">
                <DynamicSemgWaveform scrollScale={smoothWaveformScale} />
              </div>

              {/* Hardware Specifications HUD */}
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
                    Gesture-recognition smart bracelet acquiring micro-voltage surface electromyography (sEMG) paired with 6-axis IMU tracking for sub-15ms continuous gesture inference.
                  </p>

                  <div className="mt-4 space-y-2 text-[11px] font-mono text-white/80">
                    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                      <span className="text-white/60">Processor Core:</span>
                      <span className="text-[#22d3ee] font-bold">ESP32-S3 Dual-Core</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                      <span className="text-white/60">Muscle Front-End:</span>
                      <span className="text-[#ec4899] font-bold">Differential sEMG (1 kHz)</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                      <span className="text-white/60">Inertial Sensor:</span>
                      <span className="text-white font-bold">6-Axis IMU (Gyro + Accel)</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                      <span className="text-white/60">Edge ML Latency:</span>
                      <span className="text-emerald-400 font-bold">&lt; 14ms (Quantized CNN)</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-[10px] font-mono">
                  <span className="uppercase tracking-widest text-[#ec4899] font-bold">
                    Scroll Waveform Spiking Active
                  </span>
                  <p className="mt-1 text-white/60 leading-relaxed">
                    Notice the sEMG muscle potential waveform vertically spiking in amplitude as you scroll past the hardware node.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 2: HORIZONTAL "TELEMETRY" PROJECT DECK (Scroll 60% -> 85%)     */}
      {/* ==================================================================== */}
      <section
        ref={deckRef}
        className="relative h-[300vh] w-full bg-[#07070a] border-t border-white/10"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center">
          {/* Parallax Half-Speed Watermark Background */}
          <motion.div
            style={{ x: watermarkX }}
            className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[14vw] font-black uppercase tracking-tighter text-white/[0.025]"
          >
            SELECTED TELEMETRY // ARCHIVE 2026
          </motion.div>

          {/* Section Heading Bar */}
          <div className="mx-auto w-full max-w-7xl px-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#22d3ee] shadow-[0_0_8px_#22d3ee]" />
                <span className="text-xs font-mono uppercase tracking-[0.35em] text-[#22d3ee]">
                  02 // TELEMETRY PROJECT DECK
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                HORIZONTAL SCROLL JACK [4 SYSTEMS]
              </span>
            </div>
          </div>

          {/* Horizontally Translating Cards Row */}
          <motion.div
            style={{ x: smoothDeckX }}
            className="flex gap-8 px-6 sm:px-12 w-max items-center"
          >
            {/* Card 01: RE-SAPORI */}
            <motion.div
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.25 }}
              className="group relative flex h-[500px] w-[85vw] sm:w-[48vw] lg:w-[40vw] flex-col justify-between overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-b from-[#0c0c16] via-[#080810] to-[#07070a] p-8 backdrop-blur-2xl transition-all duration-300 hover:border-[#22d3ee]/80 hover:shadow-[0_0_45px_rgba(34,211,238,0.22)]"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="font-mono text-xs font-bold text-[#22d3ee] uppercase tracking-widest">
                    01 // RE-SAPORI
                  </span>
                  <span className="rounded-full bg-emerald-400/10 border border-emerald-400/30 px-2.5 py-0.5 text-[9px] font-mono text-emerald-300">
                    Live Production
                  </span>
                </div>

                <h3 className="mt-6 text-3xl font-black uppercase text-white tracking-tight group-hover:text-[#22d3ee] transition-colors">
                  Re-Sapori
                </h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">
                  Italian culinary digital platform engineered with Next.js 16 App Router, Turbopack, and reactive reservation UX.
                </p>

                <div className="mt-6 space-y-2 text-xs font-mono text-white/70">
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span>Performance TTFB:</span>
                    <span className="text-[#22d3ee]">&lt; 180ms</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span>Core Web Vitals:</span>
                    <span className="text-emerald-400">99.8%</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span>Stack:</span>
                    <span className="text-white">Next.js 16 • React 19 • Tailwind</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <a
                  href="https://resapori.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#22d3ee] group-hover:underline"
                >
                  <span>Visit Platform</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <span className="text-[10px] font-mono text-white/40">resapori.com</span>
              </div>
            </motion.div>

            {/* Card 02: MARIO JUICE */}
            <motion.div
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.25 }}
              className="group relative flex h-[500px] w-[85vw] sm:w-[48vw] lg:w-[40vw] flex-col justify-between overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-b from-[#0c0c16] via-[#080810] to-[#07070a] p-8 backdrop-blur-2xl transition-all duration-300 hover:border-[#ec4899]/80 hover:shadow-[0_0_45px_rgba(236,72,153,0.22)]"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="font-mono text-xs font-bold text-[#ec4899] uppercase tracking-widest">
                    02 // MARIO JUICE
                  </span>
                  <span className="rounded-full bg-[#ec4899]/10 border border-[#ec4899]/30 px-2.5 py-0.5 text-[9px] font-mono text-[#ec4899]">
                    Brand E-Com
                  </span>
                </div>

                <h3 className="mt-6 text-3xl font-black uppercase text-white tracking-tight group-hover:text-[#ec4899] transition-colors">
                  Mario Juice
                </h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">
                  Fresh beverage brand storefront with high-conversion mobile filtering, reactive cart engine, and bold design system.
                </p>

                <div className="mt-6 space-y-2 text-xs font-mono text-white/70">
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span>Checkout Conversion:</span>
                    <span className="text-[#ec4899]">+34% Lift</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span>Mobile First:</span>
                    <span className="text-emerald-400">100% Responsive</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span>Stack:</span>
                    <span className="text-white">TypeScript • Framer • SSR</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <a
                  href="https://mariojuice.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#ec4899] group-hover:underline"
                >
                  <span>Visit Platform</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <span className="text-[10px] font-mono text-white/40">mariojuice.com</span>
              </div>
            </motion.div>

            {/* Card 03: KIWI BAND */}
            <motion.div
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.25 }}
              className="group relative flex h-[500px] w-[85vw] sm:w-[48vw] lg:w-[40vw] flex-col justify-between overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-b from-[#0c0c16] via-[#080810] to-[#07070a] p-8 backdrop-blur-2xl transition-all duration-300 hover:border-[#22d3ee]/80 hover:shadow-[0_0_45px_rgba(34,211,238,0.22)]"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="font-mono text-xs font-bold text-[#22d3ee] uppercase tracking-widest">
                    03 // KIWI BAND
                  </span>
                  <span className="rounded-full bg-[#22d3ee]/10 border border-[#22d3ee]/30 px-2.5 py-0.5 text-[9px] font-mono text-[#22d3ee]">
                    Edge ML Prototype
                  </span>
                </div>

                <h3 className="mt-6 text-3xl font-black uppercase text-white tracking-tight group-hover:text-[#22d3ee] transition-colors">
                  Kiwi Band
                </h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">
                  ESP32 wearable gesture bracelet combining differential sEMG muscle potentials with 6-axis IMU tracking for sub-14ms gesture classification.
                </p>

                <div className="mt-6 space-y-2 text-xs font-mono text-white/70">
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span>Hardware:</span>
                    <span className="text-[#22d3ee]">ESP32-S3 Dual-Core</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span>Sampling Rate:</span>
                    <span className="text-white">1 kHz ADC + 200 Hz IMU</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span>Inference Model:</span>
                    <span className="text-emerald-400">Quantized 1D-CNN</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs font-mono text-white/70">BLE 5.2 Direct</span>
                <span className="text-[10px] font-mono text-[#22d3ee]">Low Latency</span>
              </div>
            </motion.div>

            {/* Card 04: N8N ENGINE */}
            <motion.div
              whileHover={{ y: -8, scale: 1.01 }}
              transition={{ duration: 0.25 }}
              className="group relative flex h-[500px] w-[85vw] sm:w-[48vw] lg:w-[40vw] flex-col justify-between overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-b from-[#0c0c16] via-[#080810] to-[#07070a] p-8 backdrop-blur-2xl transition-all duration-300 hover:border-[#ec4899]/80 hover:shadow-[0_0_45px_rgba(236,72,153,0.22)]"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="font-mono text-xs font-bold text-[#ec4899] uppercase tracking-widest">
                    04 // N8N ENGINE
                  </span>
                  <span className="rounded-full bg-emerald-400/10 border border-emerald-400/30 px-2.5 py-0.5 text-[9px] font-mono text-emerald-400">
                    Agentic AI
                  </span>
                </div>

                <h3 className="mt-6 text-3xl font-black uppercase text-white tracking-tight group-hover:text-[#ec4899] transition-colors">
                  Autonomous Engine
                </h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">
                  Multi-channel event orchestration linking Shopify webhooks, n8n async core, and Qwen3.5/AraBERT NLP models on WhatsApp Cloud.
                </p>

                <div className="mt-6 space-y-2 text-xs font-mono text-white/70">
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span>Throughput:</span>
                    <span className="text-[#ec4899]">10k+ events/day</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span>NLP Models:</span>
                    <span className="text-white">Qwen3.5 + AraBERT</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span>Uptime:</span>
                    <span className="text-emerald-400">99.98% SLA</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs font-mono text-white/70">Zero-Touch Automation</span>
                <span className="text-[10px] font-mono text-[#ec4899]">Autonomous</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* SECTION 3: MAGNETIC "TERMINAL CTA" CURTAIN REVEAL (Scroll 85% -> 100%) */}
      {/* ==================================================================== */}
      <footer className="relative z-20 w-full overflow-hidden bg-gradient-to-br from-[#22d3ee] via-sky-400 to-[#ec4899] text-[#07070a]">
        {/* Infinite Kinetic Marquee */}
        <div className="relative overflow-hidden border-b-2 border-[#07070a]/20 py-4 bg-black/10 backdrop-blur-sm select-none">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              duration: 18,
              ease: "linear",
            }}
            className="flex w-max whitespace-nowrap text-xs sm:text-sm font-mono font-black uppercase tracking-[0.35em] text-[#07070a]"
          >
            <span className="px-4">
              LET&apos;S BUILD SOMETHING ICONIC ✦ FULL-STACK • AI • HARDWARE ✦
            </span>
            <span className="px-4">
              LET&apos;S BUILD SOMETHING ICONIC ✦ FULL-STACK • AI • HARDWARE ✦
            </span>
            <span className="px-4">
              LET&apos;S BUILD SOMETHING ICONIC ✦ FULL-STACK • AI • HARDWARE ✦
            </span>
            <span className="px-4">
              LET&apos;S BUILD SOMETHING ICONIC ✦ FULL-STACK • AI • HARDWARE ✦
            </span>
          </motion.div>
        </div>

        {/* High-Contrast CTA Body */}
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28 flex flex-col items-center text-center">
          <span className="rounded-full border-2 border-[#07070a] bg-[#07070a]/10 px-4 py-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-[#07070a]">
            ✦ TERMINAL REVEAL // 2026 ARCHIVE
          </span>

          <h2 className="mt-8 text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-[#07070a] max-w-4xl">
            READY TO ENGINEER YOUR NEXT SYSTEM?
          </h2>

          <p className="mt-4 max-w-xl text-sm sm:text-base font-medium leading-relaxed text-[#07070a]/80">
            Available for full-stack web platforms, autonomous AI workflows, and embedded edge ML hardware architecture.
          </p>

          {/* Magnetic Cursor-Following "AVAILABLE FOR WORK" Button */}
          <div className="mt-12 flex justify-center">
            <MagneticButton />
          </div>

          {/* Bottom Telemetry & Copyright */}
          <div className="mt-20 flex w-full flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#07070a]/20 pt-8 text-[11px] font-mono uppercase tracking-[0.25em] text-[#07070a]/70">
            <span>© {new Date().getFullYear()} MARWAN LABOUDY</span>
            <span className="font-bold">STATUS: ALL SYSTEMS NOMINAL</span>
            <a
              href="#top"
              className="hover:underline font-bold text-[#07070a]"
            >
              BACK TO TOP ↑
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

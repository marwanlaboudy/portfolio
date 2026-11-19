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
  BarChart3,
  Bot,
  Brain,
  CheckCircle2,
  Cpu,
  ExternalLink,
  Flame,
  MessageSquare,
  ShoppingBag,
  Sparkles,
  Target,
  TrendingUp,
  Video,
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
// 2. HIGH-PERFORMANCE CANVAS-BASED sEMG WAVEFORM (Zero React Re-renders)
// ============================================================================
function VelocityReactiveSemg({
  velocityValue,
}: {
  velocityValue: any;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Velocity-driven amplitude spike factor
  const rawSpike = useTransform(velocityValue, [-3500, 0, 3500], [3.2, 0.8, 3.2]);
  const smoothSpike = useSpring(rawSpike, { stiffness: 320, damping: 24 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;
    const width = 560;
    const height = 120;
    const midY = height / 2;

    const render = () => {
      t += 0.04;
      ctx.clearRect(0, 0, width, height);

      // Gradient stroke
      const grad = ctx.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(0, "#22d3ee");
      grad.addColorStop(0.5, "#ec4899");
      grad.addColorStop(1, "#22d3ee");

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      for (let x = 0; x <= width; x += 4) {
        const phase = (x * 0.05 - t * 3.5) % (Math.PI * 2);
        const burstWindow = Math.sin(x * 0.02 - t * 1.2);
        const isBurst = burstWindow > 0.4;
        const spike = isBurst ? Math.pow(burstWindow, 3) * 36 : 4;
        const noise = (Math.sin(phase * 4.2) + Math.cos(phase * 7.9)) * 3;
        const y = midY + Math.sin(phase * 9.0) * spike + noise;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#22d3ee]/30 bg-[#07070a]/95 p-4 shadow-[0_0_35px_rgba(34,211,238,0.18)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="text-white/80 uppercase tracking-wider sm:tracking-widest">
            Cheri Band // Forearm sEMG Waveform
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

        {/* Real-time oscilloscope canvas */}
        <canvas
          ref={canvasRef}
          width={560}
          height={120}
          className="relative z-10 w-full h-full"
        />

        {/* Oscilloscope Reticle Lines */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-white/10" />
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-white/10" />
      </div>

      <div className="mt-3 flex items-center justify-between font-mono text-[9px] text-white/50">
        <span>BIO-POTENTIAL // 24-BIT ADC</span>
        <span className="text-emerald-400">SMART HOME & HEALTH TELEMETRY</span>
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
  const [isDesktopGrid, setIsDesktopGrid] = useState(false);

  useEffect(() => {
    const checkGrid = () => setIsDesktopGrid(window.innerWidth >= 1024);
    checkGrid();
    window.addEventListener("resize", checkGrid);
    return () => window.removeEventListener("resize", checkGrid);
  }, []);

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
  // Coordinates sweep across a 1200 x 3200 canvas in dramatic arcs
  const svgPathD =
    "M 600,0 C 980,320 1140,750 840,1180 C 520,1610 60,1980 380,2440 C 660,2840 1020,3000 600,3200";

  // Coordinates for tip-riding glowing orb calculated along the S-curve
  const orbX = useTransform(
    smoothProgress,
    [0, 0.22, 0.48, 0.74, 1],
    ["50%", "78%", "32%", "72%", "50%"]
  );
  const orbY = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  // 3. Kinetic Typography Horizontal Scrub (Non-negative offsets so left letters never clip off-screen)
  const kineticWord1XDesktop = useTransform(smoothProgress, [0.08, 0.55], ["0%", "14%"]);
  const kineticWord1XMobile = useTransform(smoothProgress, [0.08, 0.55], ["0%", "4%"]);
  const kineticWord1X = isDesktopGrid ? kineticWord1XDesktop : kineticWord1XMobile;

  const kineticWord2XDesktop = useTransform(smoothProgress, [0.08, 0.55], ["14%", "0%"]);
  const kineticWord2XMobile = useTransform(smoothProgress, [0.08, 0.55], ["4%", "0%"]);
  const kineticWord2X = isDesktopGrid ? kineticWord2XDesktop : kineticWord2XMobile;

  // 4. Staggered Scroll-Driven Depth Parallax for Cards (Active on 3-column desktop, 0 on 1-column mobile so cards never overlap):
  const reSaporiYDesktop = useTransform(smoothProgress, [0.12, 0.55], [140, -140]);
  const marioJuiceYDesktop = useTransform(smoothProgress, [0.12, 0.55], [280, -50]);
  const marioJuiceRotateDesktop = useTransform(smoothProgress, [0.12, 0.55], [-3, 1.5]);

  const reSaporiY = isDesktopGrid ? reSaporiYDesktop : 0;
  const marioJuiceY = isDesktopGrid ? marioJuiceYDesktop : 0;
  const marioJuiceRotate = isDesktopGrid ? marioJuiceRotateDesktop : 0;

  // Card opacity for smooth GPU-accelerated unveil
  const cardOpacity = useTransform(smoothProgress, [0.08, 0.22], [0.4, 1]);

  return (
    <section
      ref={sectionRef}
      id="signal-trace"
      className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 py-20 sm:py-40 overflow-hidden"
    >
      {/* Background Wide S-Curve SVG Circuit Track */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="h-full w-full opacity-60"
          viewBox="0 0 1200 3200"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="scurveGrad" x1="0" y1="0" x2="0" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="30%" stopColor="#ec4899" />
              <stop offset="65%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* Faint blueprint background path */}
          <path
            d={svgPathD}
            fill="none"
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth="3"
            strokeDasharray="6 8"
          />

          {/* GPU-accelerated outer neon bloom path (zero raster filter overhead) */}
          <motion.path
            d={svgPathD}
            fill="none"
            stroke="url(#scurveGrad)"
            strokeWidth="12"
            opacity="0.32"
            style={{ pathLength: smoothProgress, willChange: "stroke-dashoffset" }}
          />

          {/* Crisp inner neon trace */}
          <motion.path
            ref={pathRef}
            d={svgPathD}
            fill="none"
            stroke="url(#scurveGrad)"
            strokeWidth="3.5"
            style={{ pathLength: smoothProgress, willChange: "stroke-dashoffset" }}
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
      <div className="mb-16 sm:mb-24 flex flex-col items-start gap-4 overflow-hidden">
        <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#22d3ee]/40 bg-[#22d3ee]/10 px-3 sm:px-4 py-1.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.18em] sm:tracking-[0.35em] text-[#22d3ee] backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.2)]">
          <Activity className="h-3 w-3 text-[#ec4899] animate-pulse shrink-0" />
          <span className="font-extrabold">// 01. SIGNAL TRACE CIRCUIT</span>
          <span className="text-white/40">|</span>
          <span className="text-[#ec4899] font-bold">4 CORE PILLARS</span>
        </div>

        <div className="w-full overflow-hidden py-1 sm:py-2">
          <motion.h2
            style={{ x: kineticWord1X }}
            className="text-3xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tight text-white select-none whitespace-nowrap"
          >
            INTERACTIVE{" "}
            <span className="text-[#22d3ee] drop-shadow-[0_0_40px_rgba(34,211,238,0.5)]">
              SIGNAL
            </span>
          </motion.h2>
        </div>

        <div className="w-full overflow-hidden py-1">
          <motion.h2
            style={{ x: kineticWord2X }}
            className="text-3xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tight text-white select-none whitespace-nowrap"
          >
            CIRCUIT &{" "}
            <span className="text-[#ec4899] italic drop-shadow-[0_0_40px_rgba(236,72,153,0.6)]">
              TELEMETRY
            </span>
          </motion.h2>
        </div>

        <p className="max-w-2xl text-[13px] sm:text-[15px] leading-relaxed tracking-wider text-white/70">
          Scroll progress physically drives the layout across 4 dedicated pillars: Full-Stack Web, Media Buying &amp; Ads, Autonomous AI, and Edge ML Hardware.
        </p>
      </div>

      {/* ==================================================================== */}
      {/* CHECKPOINT 01: Full-Stack Web Platforms & Engineering                 */}
      {/* ==================================================================== */}
      <div className="relative mb-36 lg:mb-48">
        <div className="flex items-center gap-3 mb-8">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee] shadow-[0_0_15px_#22d3ee]">
            <span className="text-[11px] font-mono font-bold">01</span>
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#22d3ee] font-bold">
              CHECKPOINT 01 // PRODUCTION WEB ARCHITECTURE
            </span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              Full-Stack Web Engineering
            </h3>
          </div>
        </div>

        {/* Staggered Vertical Parallax Grid (Full-Stack Websites: Re-Sapori, Mario Juice, Elhuq) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Card 1: Re-Sapori (Web Platform) */}
          <motion.div
            style={{
              y: reSaporiY,
              opacity: cardOpacity,
              willChange: "transform, opacity",
            }}
          >
            <TiltCard glowColor="cyan" className="p-7 sm:p-8 flex flex-col justify-between min-h-[480px]">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#22d3ee]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                    Italian Culinary Platform
                  </span>
                  <span className="text-[10px] font-mono text-white/50">Next.js 16</span>
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
                  <div className="p-4 flex flex-col gap-2.5 bg-gradient-to-br from-[#0c0c16] to-black">
                    <h4 className="text-xl font-black uppercase text-white tracking-tight">
                      Re-Sapori
                    </h4>
                    <p className="text-[12px] leading-relaxed text-white/70">
                      Italian culinary platform featuring real-time menu navigation, table reservations UX, and instant mobile ordering transitions.
                    </p>
                    <div className="flex flex-wrap gap-1.5 text-[9px] font-mono uppercase text-white/60 pt-1">
                      <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5">Turbopack</span>
                      <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5">React 19</span>
                      <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5">SSR Menu</span>
                      <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5">Framer</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                <a
                  href="https://resapori.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#22d3ee] to-[#38bdf8] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-black shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all hover:scale-105 active:scale-95"
                >
                  <span>Launch Site</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
                <span className="text-[9px] font-mono text-white/40">resapori.com</span>
              </div>
            </TiltCard>
          </motion.div>

          {/* Card 2: Mario Juice */}
          <motion.div
            style={{
              y: marioJuiceY,
              rotate: marioJuiceRotate,
              opacity: cardOpacity,
              willChange: "transform, opacity",
            }}
          >
            <TiltCard glowColor="magenta" className="p-7 sm:p-8 flex flex-col justify-between min-h-[480px]">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#ec4899]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                    Beverage Storefront
                  </span>
                  <span className="text-[10px] font-mono text-white/50">Mobile First</span>
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
                  <div className="p-4 flex flex-col gap-2 bg-gradient-to-br from-[#0c0c16] to-black">
                    <h4 className="text-xl font-black uppercase text-white tracking-tight">
                      Mario Juice
                    </h4>
                    <p className="text-[12px] leading-relaxed text-white/70">
                      High-conversion beverage brand platform with vibrant aesthetic, instant cart filtering, and ultra-responsive layout performance.
                    </p>
                    <div className="flex flex-wrap gap-1.5 text-[9px] font-mono uppercase text-white/60 pt-1">
                      <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5">Brand Identity</span>
                      <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5">High Conversion</span>
                      <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5">SSR</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                <a
                  href="https://mariojuice.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#ec4899] to-[#f43f5e] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all hover:scale-105 active:scale-95"
                >
                  <span>Launch Site</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
                <span className="text-[9px] font-mono text-white/40">mariojuice.com</span>
              </div>
            </TiltCard>
          </motion.div>

          {/* Card 3: Elhuq (Dar Monasbat Oman) */}
          <motion.div
            style={{
              y: reSaporiY,
              opacity: cardOpacity,
              willChange: "transform, opacity",
            }}
          >
            <TiltCard glowColor="cyan" className="p-7 sm:p-8 flex flex-col justify-between min-h-[480px]">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#22d3ee]">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                    Dar Monasbat • Oman
                  </span>
                  <span className="text-[10px] font-mono text-white/50">Events &amp; Halls</span>
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/85 shadow-2xl">
                  <div className="flex items-center justify-between bg-white/[0.04] px-4 py-2 border-b border-white/10 text-[10px] font-mono text-white/60">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500/70" />
                      <span className="h-2 w-2 rounded-full bg-yellow-500/70" />
                      <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
                    </div>
                    <span className="truncate text-[#22d3ee]">https://elhuq.com</span>
                    <ExternalLink className="h-3 w-3 text-white/40" />
                  </div>
                  <div className="p-4 flex flex-col gap-2 bg-gradient-to-br from-[#0c0c16] to-black">
                    <h4 className="text-xl font-black uppercase text-white tracking-tight">
                      Elhuq
                    </h4>
                    <p className="text-[12px] leading-relaxed text-white/70">
                      Luxury Dar Monasbat venue in Oman for weddings, banquets, and major celebrations with custom hall reservation scheduling.
                    </p>
                    <div className="flex flex-wrap gap-1.5 text-[9px] font-mono uppercase text-white/60 pt-1">
                      <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5">Dar Monasbat</span>
                      <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5">Oman Venue</span>
                      <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5">Booking UX</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                <a
                  href="https://elhuq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#22d3ee] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-black shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all hover:scale-105 active:scale-95"
                >
                  <span>Launch Site</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
                <span className="text-[9px] font-mono text-white/40">elhuq.com</span>
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CHECKPOINT 02: Media Buying & Content Creation (Re-Sapori Pizza Truck) */}
      {/* ==================================================================== */}
      <div className="relative mb-36 lg:mb-48">
        <div className="flex items-center gap-3 mb-8">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee] shadow-[0_0_15px_#22d3ee]">
            <span className="text-[11px] font-mono font-bold">02</span>
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#22d3ee] font-bold">
              CHECKPOINT 02 // PAID ADVERTISING & MEDIA BUYING
            </span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              Media Buying &amp; Content Creation
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Card A: Media Buying & Ad Campaign Architecture */}
          <div className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#0e0e1a] via-[#080812] to-black p-7 sm:p-9 backdrop-blur-2xl transition-all duration-300 hover:border-[#22d3ee]/80 hover:shadow-[0_0_40px_rgba(34,211,238,0.2)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#22d3ee]">
                  <Target className="h-3.5 w-3.5 text-[#22d3ee]" />
                  Re-Sapori Pizza Food Truck
                </span>
                <span className="rounded-full bg-emerald-400/10 border border-emerald-400/30 px-2.5 py-0.5 text-[9px] font-mono text-emerald-300">
                  Paid Growth &amp; Scaling
                </span>
              </div>

              <h4 className="mt-4 text-2xl font-black uppercase text-white tracking-tight group-hover:text-[#22d3ee] transition-colors">
                Performance Media Buying
              </h4>
              <p className="mt-2 text-[13px] leading-relaxed text-white/70">
                Architecting high-converting paid advertising funnels across Meta (Instagram / Facebook) and TikTok for the Re-Sapori pizza food truck. Managing budget allocation, audience micro-targeting, and hyper-local dayparting to drive immediate foot traffic to the truck.
              </p>

              {/* Performance Metrics HUD Grid */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                  <span className="block text-[10px] font-mono uppercase text-white/50">Blended ROAS</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">4.6x</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                  <span className="block text-[10px] font-mono uppercase text-white/50">Local Reach</span>
                  <span className="text-lg font-black text-[#22d3ee] font-mono">210K+</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                  <span className="block text-[10px] font-mono uppercase text-white/50">Avg CPC</span>
                  <span className="text-lg font-black text-[#ec4899] font-mono">$0.19</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                  <span className="block text-[10px] font-mono uppercase text-white/50">Footfall Lift</span>
                  <span className="text-lg font-black text-amber-400 font-mono">+320%</span>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-xs font-mono text-white/70">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Radius Geo-Targeting (5–8 km around active truck location)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#22d3ee] shrink-0" />
                  <span>Hunger-Hour Dayparting (Peak lunch &amp; evening rush surges)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#ec4899] shrink-0" />
                  <span>Audience Retargeting &amp; High-Intent Foodie Lookalikes</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/50">
              <span>Platforms: Meta Ads Manager • TikTok Ads</span>
              <span className="text-[#22d3ee] font-bold">Direct Foot Traffic Funnel</span>
            </div>
          </div>

          {/* Card B: Food Content Creation & Video Ads */}
          <div className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#0e0e1a] via-[#080812] to-black p-7 sm:p-9 backdrop-blur-2xl transition-all duration-300 hover:border-[#ec4899]/80 hover:shadow-[0_0_40px_rgba(236,72,153,0.2)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#ec4899]">
                  <Video className="h-3.5 w-3.5 text-[#ec4899]" />
                  Creative Production
                </span>
                <span className="rounded-full bg-[#ec4899]/10 border border-[#ec4899]/30 px-2.5 py-0.5 text-[9px] font-mono text-[#ec4899]">
                  Visuals &amp; Ads
                </span>
              </div>

              <h4 className="mt-4 text-2xl font-black uppercase text-white tracking-tight group-hover:text-[#ec4899] transition-colors">
                Content Creation &amp; Ads Production
              </h4>
              <p className="mt-2 text-[13px] leading-relaxed text-white/70">
                Filming and editing cinematic short-form food videos, artisanal pizza craftsmanship reels, and street food truck atmosphere. Creating viral TikTok hooks and Instagram video ads that convert passive viewers into hungry customers.
              </p>

              {/* Visual Showcase Card Mockup */}
              <div className="mt-5 overflow-hidden rounded-2xl border border-white/15 bg-black/80 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-[10px] font-mono text-white/60">
                  <span className="flex items-center gap-1.5 text-[#ec4899] font-bold">
                    <Flame className="h-3.5 w-3.5 text-[#ec4899]" />
                    Creative Pipeline
                  </span>
                  <span>Weekly Video Drops</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                  <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
                    <span className="block text-white font-bold">Wood-Fired</span>
                    <span className="text-white/40 text-[9px]">Oven Action</span>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
                    <span className="block text-[#22d3ee] font-bold">Cheese Pull</span>
                    <span className="text-white/40 text-[9px]">Macro Shots</span>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">
                    <span className="block text-[#ec4899] font-bold">Viral Hooks</span>
                    <span className="text-white/40 text-[9px]">Fast Cuts</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs font-mono text-white/70">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Cinematic 4K Food Visuals &amp; Sound Design</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#ec4899] shrink-0" />
                  <span>Continuous Creative A/B Hook &amp; CTA Testing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#22d3ee] shrink-0" />
                  <span>Conversion Copywriting Tailored for Fast-Casual Dining</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/50">
              <span>Output: 9:16 Video Ads • Static Carousels</span>
              <span className="text-[#ec4899] font-bold">High CTR &amp; Engagement</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CHECKPOINT 03: AI & Automations (Mountain View Chatbot & Dropshipping) */}
      {/* ==================================================================== */}
      <div className="relative mb-36 lg:mb-48">
        <div className="flex items-center gap-3 mb-8">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ec4899] bg-[#ec4899]/20 text-[#ec4899] shadow-[0_0_15px_#ec4899]">
            <span className="text-[11px] font-mono font-bold">03</span>
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ec4899] font-bold">
              CHECKPOINT 03 // AUTONOMOUS AI & AUTOMATIONS
            </span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              AI &amp; Automations
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Project A: Mountain View Real Estate AI Chatbot (With Video Player Slot) */}
          <div className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#0e0e1a] via-[#080812] to-black p-7 sm:p-9 backdrop-blur-2xl transition-all duration-300 hover:border-[#22d3ee]/80 hover:shadow-[0_0_40px_rgba(34,211,238,0.2)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#22d3ee]">
                  <Bot className="h-3.5 w-3.5 text-[#22d3ee]" />
                  Enterprise Real Estate Bot
                </span>
                <span className="rounded-full bg-[#22d3ee]/10 border border-[#22d3ee]/30 px-2.5 py-0.5 text-[9px] font-mono text-[#22d3ee]">
                  Mountain View Test
                </span>
              </div>

              <h4 className="mt-4 text-2xl font-black uppercase text-white tracking-tight group-hover:text-[#22d3ee] transition-colors">
                Mountain View AI Chatbot
              </h4>
              <p className="mt-2 text-[13px] leading-relaxed text-white/70">
                Automated Facebook lead scraper that extracts qualified prospective buyers and engages them immediately via conversational AI, answering property inquiries and scheduling viewing tours.
              </p>

              {/* Video Player Demo Container Slot */}
              <div className="mt-5 overflow-hidden rounded-2xl border border-white/15 bg-black/90 shadow-2xl relative aspect-video flex flex-col items-center justify-center group/video">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster="/gaze_frames/frame_0001.webp"
                  className="w-full h-full object-cover rounded-2xl"
                >
                  <source src="/videos/mountain-view-demo.mp4" type="video/mp4" />
                  Your browser does not support HTML video.
                </video>

                {/* Video Demo Badge Overlay */}
                <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-2 rounded-lg bg-black/80 border border-white/20 px-2.5 py-1 text-[9px] font-mono text-white backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>DEMO VIDEO SLOT // MOUNTAIN VIEW CHATBOT</span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs font-mono text-white/70">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Automated Facebook Lead Ingestion &amp; Scraping</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#22d3ee] shrink-0" />
                  <span>Instant Conversational SMS &amp; WhatsApp Follow-Up</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/50">
              <span>Stack: Python • WhatsApp API • Meta Graph</span>
              <span className="text-emerald-400 font-bold">&lt; 30s Lead Outreach</span>
            </div>
          </div>

          {/* Project B: Fully Automated Dropshipping & E-Commerce System (With n8n Link) */}
          <div className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#0e0e1a] via-[#080812] to-black p-7 sm:p-9 backdrop-blur-2xl transition-all duration-300 hover:border-[#ec4899]/80 hover:shadow-[0_0_40px_rgba(236,72,153,0.2)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#ec4899]">
                  <Sparkles className="h-3.5 w-3.5 text-[#ec4899]" />
                  Zero-Touch Commercial Engine
                </span>
                <span className="rounded-full bg-[#ec4899]/10 border border-[#ec4899]/30 px-2.5 py-0.5 text-[9px] font-mono text-[#ec4899]">
                  100% Automated
                </span>
              </div>

              <h4 className="mt-4 text-2xl font-black uppercase text-white tracking-tight group-hover:text-[#ec4899] transition-colors">
                Autonomous Dropshipping Pipeline
              </h4>
              <p className="mt-2 text-[13px] leading-relaxed text-white/70">
                End-to-end autonomous e-commerce infrastructure that discovers daily best-selling products, scrapes competitor assets, generates high-converting landing pages, creates ads, and triggers automatic customer fulfillment.
              </p>

              {/* 3-Stage Pipeline Diagram */}
              <div className="mt-5 space-y-2.5">
                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
                  <div className="h-6 w-6 rounded-lg bg-[#22d3ee]/20 flex items-center justify-center text-[#22d3ee] font-mono font-bold text-[10px] shrink-0 mt-0.5">
                    01
                  </div>
                  <div>
                    <span className="font-bold text-white uppercase text-[11px] font-mono">
                      Daily Winner Scraper &amp; Intelligence
                    </span>
                    <p className="text-white/60 text-[11px] mt-0.5">
                      Monitors daily best sellers across marketplaces and scrapes trending specs and reviews.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
                  <div className="h-6 w-6 rounded-lg bg-[#ec4899]/20 flex items-center justify-center text-[#ec4899] font-mono font-bold text-[10px] shrink-0 mt-0.5">
                    02
                  </div>
                  <div>
                    <span className="font-bold text-white uppercase text-[11px] font-mono">
                      Autonomous Page &amp; Ad Creatives
                    </span>
                    <p className="text-white/60 text-[11px] mt-0.5">
                      Synthesizes product page copy, hero visuals, and targeted advertising angles automatically.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
                  <div className="h-6 w-6 rounded-lg bg-emerald-400/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-[10px] shrink-0 mt-0.5">
                    03
                  </div>
                  <div>
                    <span className="font-bold text-white uppercase text-[11px] font-mono">
                      Zero-Touch Order Purchase &amp; Fulfillment
                    </span>
                    <p className="text-white/60 text-[11px] mt-0.5">
                      When someone buys from the website, the pipeline autonomously purchases from the supplier and triggers tracking.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dedicated n8n Automation Link Slot */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href="https://n8n.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ec4899] to-[#f43f5e] px-5 py-2.5 text-[11px] font-mono font-black uppercase tracking-wider text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all hover:scale-105 active:scale-95"
              >
                <Workflow className="h-4 w-4" />
                <span>View n8n Automations</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <span className="text-[10px] font-mono text-white/40">n8n Workflow Blueprint Link</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CHECKPOINT 04: Hardware & Edge ML // CHERI BAND                       */}
      {/* ==================================================================== */}
      <div className="relative mb-20">
        <div className="flex items-center gap-3 mb-8">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#22d3ee] bg-[#22d3ee]/20 text-[#22d3ee] shadow-[0_0_15px_#22d3ee]">
            <span className="text-[11px] font-mono font-bold">04</span>
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#22d3ee] font-bold">
              CHECKPOINT 04 // GESTURE &amp; HEALTH TELEMETRY
            </span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              Hardware &amp; Edge ML // Cheri Band
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
                  Dual-Engine Wearable
                </span>
                <span className="rounded-full bg-[#22d3ee]/10 border border-[#22d3ee]/30 px-2.5 py-0.5 text-[9px] font-mono text-[#22d3ee]">
                  BLE 5.2
                </span>
              </div>

              <h4 className="text-xl font-bold text-white mt-3 uppercase tracking-tight">
                Cheri Band
              </h4>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#ec4899] mt-0.5 font-bold">
                Hand Gesture Smart Home Band &amp; Health Tracker
              </p>

              <p className="mt-2.5 text-[13px] leading-relaxed text-white/70">
                Dual-purpose smart wearable combining micro-voltage surface electromyography (sEMG) for contactless smart home appliance control (lights, AC, volume, media, locks) with continuous biometric health tracking.
              </p>

              <div className="mt-4 space-y-2 text-[11px] font-mono text-white/80">
                <div className="flex flex-wrap items-center justify-between gap-1 rounded-lg bg-white/5 px-3 py-2">
                  <span className="text-white/60">Smart Home Controls:</span>
                  <span className="text-[#22d3ee] font-bold">Lights, AC, Volume, Locks</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-1 rounded-lg bg-white/5 px-3 py-2">
                  <span className="text-white/60">Health Tracker:</span>
                  <span className="text-[#ec4899] font-bold">Continuous HR &amp; Muscle Telemetry</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-1 rounded-lg bg-white/5 px-3 py-2">
                  <span className="text-white/60">Sensor Array:</span>
                  <span className="text-white font-bold">24-bit sEMG ADC + 6-Axis IMU</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-1 rounded-lg bg-white/5 px-3 py-2">
                  <span className="text-white/60">Edge Model:</span>
                  <span className="text-emerald-400 font-bold">Quantized 1D-CNN (TinyML)</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-[10px] font-mono">
              <span className="uppercase tracking-widest text-[#ec4899] font-bold">
                Gesture &amp; Health Telemetry Active
              </span>
              <p className="mt-1 text-white/60 leading-relaxed">
                Scroll faster to see the sEMG muscle potential waveform vertically spike with physiological contraction bursts, settling back into calm rhythm when stopped.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

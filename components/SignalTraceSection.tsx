"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
  AnimatePresence,
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

// Helper for 3D card tilt effect on mouse move
function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -7;
    const rotY = ((x - centerX) / centerX) * 7;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{ transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Live simulated sEMG bio-signal oscilloscope for Cheri Band (Smart Home Gesture & Health Tracker)
function SemgOscilloscope() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeGesture, setActiveGesture] = useState<{
    gesture: string;
    action: string;
    conf: number;
  }>({
    gesture: "PINCH_INDEX",
    action: "TOGGLE SMART LIGHTS",
    conf: 98.6,
  });

  const [heartRate, setHeartRate] = useState<number>(72);

  useEffect(() => {
    const gestures = [
      { gesture: "PINCH_INDEX", action: "TOGGLE SMART LIGHTS", conf: 98.4 },
      { gesture: "ROTATE_CW", action: "VOLUME / THERMOSTAT +", conf: 99.1 },
      { gesture: "DOUBLE_TAP", action: "AC MODE SWITCH", conf: 97.8 },
      { gesture: "FIST_HOLD", action: "SMART LOCK & ARM", conf: 98.9 },
      { gesture: "SWIPE_RIGHT", action: "NEXT MEDIA TRACK", conf: 99.4 },
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % gestures.length;
      setActiveGesture(gestures[idx]);
      setHeartRate(70 + Math.floor(Math.random() * 6));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    const render = () => {
      t += 0.04;
      ctx.fillStyle = "rgba(6, 6, 12, 0.28)";
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = "rgba(126, 232, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 30) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Zero-potential baseline
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw real-time raw sEMG neuromuscular waveform
      ctx.strokeStyle = "#7ee8ff";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#7ee8ff";
      ctx.shadowBlur = 10;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        // Compound wave simulating motor unit action potentials (MUAP bursts)
        const phase = x * 0.04 - t * 4;
        const burstWindow = Math.sin(x * 0.015 - t * 1.5);
        const burst = burstWindow > 0.4 ? Math.pow(burstWindow, 3) * 38 : 3;

        const noise = (Math.sin(phase * 3.7) + Math.cos(phase * 7.1)) * 4;
        const spike =
          Math.sin(phase * 12.0) * burst * (Math.sin(phase * 2.1) > 0 ? 1 : -0.7);

        const y = midY + spike + noise;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#7ee8ff]/30 bg-[#06060c] p-4 shadow-[0_0_35px_rgba(126,232,255,0.15)]">
      {/* Scope Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="text-white/80 uppercase tracking-widest">
            Cheri Band Telemetry: Smart Home & Health
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#ff2fb9] font-bold">♥ {heartRate} BPM</span>
          <span className="text-[#7ee8ff] font-bold">1000 Hz sEMG</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative mt-3 h-36 w-full overflow-hidden rounded-xl bg-black/90">
        <canvas
          ref={canvasRef}
          width={640}
          height={144}
          className="h-full w-full block"
        />

        {/* Live Classifier Overlay */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 rounded-lg border border-[#ff2fb9]/40 bg-black/85 px-2.5 py-1 backdrop-blur-md">
            <Zap className="h-3 w-3 text-[#ff2fb9]" />
            <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
              {activeGesture.gesture}
            </span>
            <span className="rounded bg-[#ff2fb9]/20 px-1.5 py-0.5 text-[9px] font-mono text-[#ff2fb9]">
              {activeGesture.conf}%
            </span>
          </div>
          <span className="text-[9px] font-mono uppercase tracking-wider text-[#7ee8ff] bg-black/70 px-2 py-0.5 rounded border border-[#7ee8ff]/30">
            Smart Home: {activeGesture.action}
          </span>
        </div>

        <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[9px] font-mono text-white/50">
          <span>Range: ±150 µV</span>
          <span className="text-emerald-400">Health: Continuous ECG/PPG</span>
          <span className="text-[#7ee8ff]">BLE 5.2</span>
        </div>
      </div>
    </div>
  );
}

export default function SignalTraceSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  // Scroll depth tracking for progressive path drawing
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 75%", "end 85%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    restDelta: 0.001,
  });

  // Calculate active checkpoint highlights
  const [activeNode, setActiveNode] = useState<number>(1);

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      if (v < 0.35) setActiveNode(1);
      else if (v < 0.7) setActiveNode(2);
      else setActiveNode(3);
    });
  }, [scrollYProgress]);

  return (
    <section
      ref={containerRef}
      id="experience"
      className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 py-24 sm:py-36 overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/4 -left-48 h-[600px] w-[600px] rounded-full bg-[#7ee8ff]/8 blur-[180px]" />
        <div className="absolute top-2/3 -right-48 h-[600px] w-[600px] rounded-full bg-[#ff2fb9]/10 blur-[180px]" />
      </div>

      {/* Section Header */}
      <div className="mb-20 flex flex-col items-start gap-4">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-[#7ee8ff]/40 bg-[#7ee8ff]/10 px-4 py-1.5 text-[10px] font-mono uppercase tracking-[0.35em] text-[#7ee8ff] backdrop-blur-md shadow-[0_0_20px_rgba(126,232,255,0.2)]">
          <Activity className="h-3 w-3 text-[#ff2fb9] animate-pulse" />
          <span className="font-extrabold">// 01. INTERACTIVE SIGNAL TRACE</span>
          <span className="text-white/40">|</span>
          <span className="text-[#ff2fb9] font-bold">FULL SPECTRUM</span>
        </div>

        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white">
          ENGINEERING &{" "}
          <span className="text-[#ff2fb9] italic drop-shadow-[0_0_40px_rgba(255,47,185,0.6)]">
            SYSTEMS TRACE
          </span>
        </h2>

        <p className="max-w-3xl text-[13px] sm:text-[15px] leading-relaxed tracking-wider text-white/70">
          From full-stack creative web architectures to autonomous enterprise automation pipelines and biomedical sEMG/IMU gesture band hardware.
        </p>
      </div>

      {/* Main Grid: Interactive Signal Line Weaves Down the Section */}
      <div className="relative">
        {/* Desktop Vertical Central Signal Trace SVG Line */}
        <div className="pointer-events-none absolute left-6 lg:left-1/2 top-0 bottom-0 -translate-x-1/2 w-12 hidden sm:block z-0">
          <svg
            className="h-full w-full"
            preserveAspectRatio="none"
            viewBox="0 0 40 1000"
          >
            <defs>
              <linearGradient id="traceGrad" x1="0" y1="0" x2="0" y2="100%">
                <stop offset="0%" stopColor="#7ee8ff" />
                <stop offset="45%" stopColor="#ff2fb9" />
                <stop offset="75%" stopColor="#7ee8ff" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>

              <filter id="neonTraceGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#7ee8ff" />
                <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#ff2fb9" />
              </filter>
            </defs>

            {/* Background inactive faint blueprint circuit trace */}
            <path
              d="M 20 0 L 20 280 Q 20 310 32 330 T 20 380 L 20 620 Q 20 650 8 670 T 20 720 L 20 850 L 28 860 L 12 875 L 30 890 L 10 905 L 20 920 L 20 1000"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="2.5"
              strokeDasharray="4 6"
            />

            {/* Active drawing neon signal line (tied to scroll progress) */}
            <motion.path
              d="M 20 0 L 20 280 Q 20 310 32 330 T 20 380 L 20 620 Q 20 650 8 670 T 20 720 L 20 850 L 28 860 L 12 875 L 30 890 L 10 905 L 20 920 L 20 1000"
              fill="none"
              stroke="url(#traceGrad)"
              strokeWidth="3.5"
              filter="url(#neonTraceGlow)"
              style={{
                pathLength: smoothProgress,
              }}
            />
          </svg>
        </div>

        {/* ============================================================== */}
        {/* CHECKPOINT 1: Web & Brand Architecture (Re Sapori & Mario Juice) */}
        {/* ============================================================== */}
        <div className="relative z-10 mb-28 lg:mb-36">
          {/* Node Badge Anchor */}
          <div className="flex items-center gap-3 mb-6">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-500 ${
                activeNode >= 1
                  ? "border-[#7ee8ff] bg-[#7ee8ff]/20 text-[#7ee8ff] shadow-[0_0_15px_#7ee8ff]"
                  : "border-white/20 bg-white/5 text-white/40"
              }`}
            >
              <span className="text-[10px] font-mono font-bold">01</span>
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#7ee8ff] font-bold">
                CHECKPOINT 01 // SYNAPSE ONLINE
              </span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                Web & Brand Architecture
              </h3>
            </div>
          </div>

          {/* Cards Grid with 3D Tilt */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Re Sapori Tilt Card */}
            <TiltCard className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-[#0e0e1a] via-[#080812] to-black p-6 sm:p-7 backdrop-blur-xl transition-all duration-500 hover:border-[#7ee8ff]/80 hover:shadow-[0_0_40px_rgba(126,232,255,0.25)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#7ee8ff]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                    Live Storefront
                  </span>
                  <span className="text-[10px] font-mono text-white/50">Next.js 16</span>
                </div>

                {/* Browser Preview Mockup */}
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-2xl">
                  <div className="flex items-center justify-between bg-white/[0.04] px-3.5 py-2 border-b border-white/10 text-[10px] font-mono text-white/60">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500/70" />
                      <span className="h-2 w-2 rounded-full bg-yellow-500/70" />
                      <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
                    </div>
                    <span className="truncate text-[#7ee8ff]">https://resapori.com</span>
                    <ExternalLink className="h-3 w-3 text-white/40" />
                  </div>
                  <div className="p-4 flex flex-col gap-2.5 bg-gradient-to-br from-[#0c0c16] to-black">
                    <h4 className="text-xl font-black uppercase text-white tracking-tight group-hover:text-[#7ee8ff] transition-colors">
                      Re Sapori
                    </h4>
                    <p className="text-[12px] leading-relaxed text-white/70">
                      Italian culinary platform with real-time menu navigation, table reservations, and kinetic UI.
                    </p>
                    <div className="flex flex-wrap gap-1.5 text-[9px] font-mono uppercase text-white/60 pt-1">
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">Turbopack</span>
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">React 19</span>
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">Framer</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                <a
                  href="https://resapori.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7ee8ff] to-[#38bdf8] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-black shadow-[0_0_15px_rgba(126,232,255,0.4)] transition-all hover:scale-105 active:scale-95"
                >
                  <span>Launch Site</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <span className="text-[9px] font-mono text-white/40">Preview via side phone</span>
              </div>
            </TiltCard>

            {/* Mario Juice Tilt Card */}
            <TiltCard className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-[#0e0e1a] via-[#080812] to-black p-6 sm:p-7 backdrop-blur-xl transition-all duration-500 hover:border-[#ff2fb9]/80 hover:shadow-[0_0_40px_rgba(255,47,185,0.25)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#ff2fb9]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                    Live Storefront
                  </span>
                  <span className="text-[10px] font-mono text-white/50">Modern Brand UI</span>
                </div>

                {/* Browser Preview Mockup */}
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-2xl">
                  <div className="flex items-center justify-between bg-white/[0.04] px-3.5 py-2 border-b border-white/10 text-[10px] font-mono text-white/60">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500/70" />
                      <span className="h-2 w-2 rounded-full bg-yellow-500/70" />
                      <span className="h-2 w-2 rounded-full bg-emerald-500/70" />
                    </div>
                    <span className="truncate text-[#ff2fb9]">https://mariojuice.com</span>
                    <ExternalLink className="h-3 w-3 text-white/40" />
                  </div>
                  <div className="p-4 flex flex-col gap-2.5 bg-gradient-to-br from-[#0c0c16] to-black">
                    <h4 className="text-xl font-black uppercase text-white tracking-tight group-hover:text-[#ff2fb9] transition-colors">
                      Mario Juice
                    </h4>
                    <p className="text-[12px] leading-relaxed text-white/70">
                      High-conversion beverage brand platform with vibrant aesthetic, instant cart UX, and mobile speed.
                    </p>
                    <div className="flex flex-wrap gap-1.5 text-[9px] font-mono uppercase text-white/60 pt-1">
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">Mobile First</span>
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">Brand Identity</span>
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">Tailwind</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                <a
                  href="https://mariojuice.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff2fb9] to-[#ec4899] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white shadow-[0_0_15px_rgba(255,47,185,0.4)] transition-all hover:scale-105 active:scale-95"
                >
                  <span>Launch Site</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <span className="text-[9px] font-mono text-white/40">Preview via side phone</span>
              </div>
            </TiltCard>

            {/* Cheri Band Tilt Card */}
            <TiltCard className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-[#0e0e1a] via-[#080812] to-black p-6 sm:p-7 backdrop-blur-xl transition-all duration-500 hover:border-white/80 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-white/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]" />
                    Brand & Audio-Visual
                  </span>
                  <span className="text-[10px] font-mono text-[#ff2fb9]">Co-Founder</span>
                </div>

                {/* Media Preview Mockup */}
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-2xl">
                  <div className="flex items-center justify-between bg-white/[0.04] px-3.5 py-2 border-b border-white/10 text-[10px] font-mono text-white/60">
                    <span className="text-white/40">AUDIO-VISUAL IDENTITY</span>
                    <span className="text-[#ff2fb9]">LIVE STAGE</span>
                  </div>
                  <div className="p-4 flex flex-col gap-2.5 bg-gradient-to-br from-[#0c0c16] to-black">
                    <h4 className="text-xl font-black uppercase text-white tracking-tight group-hover:text-[#ff2fb9] transition-colors">
                      Cheri Band
                    </h4>
                    <p className="text-[12px] leading-relaxed text-white/70">
                      Co-founded and shaped the multimedia identity, stage visual direction, digital presence, and brand architecture.
                    </p>
                    <div className="flex flex-wrap gap-1.5 text-[9px] font-mono uppercase text-white/60 pt-1">
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">Brand Strategy</span>
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">Creative Dir</span>
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">Multimedia</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff2fb9] font-bold">
                  Creative Direction
                </span>
                <span className="text-[9px] font-mono text-white/40">Live Production</span>
              </div>
            </TiltCard>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CHECKPOINT 2: Automation & AI Systems (Autonomous Dropshipping & Mountain View Bot) */}
        {/* ============================================================== */}
        <div className="relative z-10 mb-28 lg:mb-36">
          {/* Node Badge Anchor */}
          <div className="flex items-center gap-3 mb-6">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-500 ${
                activeNode >= 2
                  ? "border-[#ff2fb9] bg-[#ff2fb9]/20 text-[#ff2fb9] shadow-[0_0_15px_#ff2fb9]"
                  : "border-white/20 bg-white/5 text-white/40"
              }`}
            >
              <span className="text-[10px] font-mono font-bold">02</span>
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ff2fb9] font-bold">
                CHECKPOINT 02 // AUTONOMOUS AI & AUTOMATIONS
              </span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                Autonomous AI Systems & Growth Pipelines
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* System 1: Fully Automated Dropshipping & E-Commerce Engine */}
            <div className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#0e0e1a] via-[#080812] to-black p-7 sm:p-9 backdrop-blur-2xl transition-all duration-500 hover:border-[#ff2fb9]/80 hover:shadow-[0_0_45px_rgba(255,47,185,0.22)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#ff2fb9]">
                    <Sparkles className="h-3 w-3 text-[#ff2fb9]" />
                    End-to-End Autonomous E-Commerce
                  </span>
                  <span className="rounded-full bg-emerald-400/10 border border-emerald-400/30 px-2 py-0.5 text-[9px] font-mono text-emerald-400">
                    Zero-Touch
                  </span>
                </div>

                <h4 className="mt-4 text-2xl font-black uppercase text-white tracking-tight group-hover:text-[#ff2fb9] transition-colors">
                  Autonomous Dropshipping Engine
                </h4>

                <p className="mt-2.5 text-[13px] leading-relaxed text-white/70">
                  Self-driving commercial pipeline that discovers viral products, generates dedicated storefronts, synthesizes ad campaigns, and fulfills purchases automatically.
                </p>

                {/* Step-by-Step Autonomous Loop */}
                <div className="mt-5 space-y-2.5">
                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
                    <div className="h-6 w-6 rounded-lg bg-[#ff2fb9]/20 flex items-center justify-center text-[#ff2fb9] font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      01
                    </div>
                    <div>
                      <span className="font-bold text-white uppercase text-[11px] font-mono">
                        Daily Best-Seller Scraper
                      </span>
                      <p className="text-white/60 text-[11px] mt-0.5">
                        Scrapes high-velocity trending products and viral winners across e-commerce marketplaces daily.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
                    <div className="h-6 w-6 rounded-lg bg-[#7ee8ff]/20 flex items-center justify-center text-[#7ee8ff] font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      02
                    </div>
                    <div>
                      <span className="font-bold text-white uppercase text-[11px] font-mono">
                        Autonomous Landing Page & Ads
                      </span>
                      <p className="text-white/60 text-[11px] mt-0.5">
                        Extracts product assets, generates high-converting landing pages, and compiles targeted ad creatives automatically.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
                    <div className="h-6 w-6 rounded-lg bg-emerald-400/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      03
                    </div>
                    <div>
                      <span className="font-bold text-white uppercase text-[11px] font-mono">
                        Instant Zero-Touch Supplier Fulfillment
                      </span>
                      <p className="text-white/60 text-[11px] mt-0.5">
                        When a customer checks out, the pipeline autonomously places the order with the supplier and routes tracking directly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/50">
                <span>Stack: Python • Webhooks • Headless E-Com</span>
                <span className="text-[#ff2fb9] font-bold">100% Automated</span>
              </div>
            </div>

            {/* System 2: Mountain View AI Chatbot & Facebook Lead Scraper */}
            <div className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#0e0e1a] via-[#080812] to-black p-7 sm:p-9 backdrop-blur-2xl transition-all duration-500 hover:border-[#7ee8ff]/80 hover:shadow-[0_0_45px_rgba(126,232,255,0.22)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#7ee8ff]">
                    <Bot className="h-3 w-3 text-[#7ee8ff]" />
                    Enterprise Real Estate Pilot
                  </span>
                  <span className="rounded-full bg-[#7ee8ff]/10 border border-[#7ee8ff]/30 px-2 py-0.5 text-[9px] font-mono text-[#7ee8ff]">
                    Mountain View Test
                  </span>
                </div>

                <h4 className="mt-4 text-2xl font-black uppercase text-white tracking-tight group-hover:text-[#7ee8ff] transition-colors">
                  Mountain View Lead Bot
                </h4>

                <p className="mt-2.5 text-[13px] leading-relaxed text-white/70">
                  Intelligent property engagement system combining automated social scraping with real-time conversational qualification to capture and convert high-intent buyers.
                </p>

                {/* Architecture Highlights */}
                <div className="mt-5 space-y-2.5">
                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
                    <div className="h-6 w-6 rounded-lg bg-[#7ee8ff]/20 flex items-center justify-center text-[#7ee8ff] font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      <Share2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-white uppercase text-[11px] font-mono">
                        Facebook Lead Scraper Engine
                      </span>
                      <p className="text-white/60 text-[11px] mt-0.5">
                        Autonomous scraping pipelines tracking targeted groups and inquiries to extract qualified real estate lead contacts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
                    <div className="h-6 w-6 rounded-lg bg-[#ff2fb9]/20 flex items-center justify-center text-[#ff2fb9] font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-white uppercase text-[11px] font-mono">
                        Instant SMS & WhatsApp Conversational AI
                      </span>
                      <p className="text-white/60 text-[11px] mt-0.5">
                        Instantly triggers personalized outreach texts, answers property questions, and qualifies buyer intent within seconds.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
                    <div className="h-6 w-6 rounded-lg bg-emerald-400/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-white uppercase text-[11px] font-mono">
                        Tested & Validated for Mountain View
                      </span>
                      <p className="text-white/60 text-[11px] mt-0.5">
                        Engineered specifically to test and streamline lead velocity and booking conversion rates for luxury developments.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/50">
                <span>Stack: Facebook Scraping • SMS/WhatsApp • NLP</span>
                <span className="text-[#7ee8ff] font-bold">&lt; 30s Lead Outreach</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CHECKPOINT 3: Hardware & Edge ML (Cheri Band: Smart Home Gesture & Health Tracker) */}
        {/* ============================================================== */}
        <div className="relative z-10 mb-20">
          {/* Node Badge Anchor */}
          <div className="flex items-center gap-3 mb-6">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-500 ${
                activeNode >= 3
                  ? "border-[#7ee8ff] bg-[#7ee8ff]/20 text-[#7ee8ff] shadow-[0_0_15px_#7ee8ff]"
                  : "border-white/20 bg-white/5 text-white/40"
              }`}
            >
              <span className="text-[10px] font-mono font-bold">03</span>
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#7ee8ff] font-bold">
                CHECKPOINT 03 // LIVE sEMG WAVEFORM & HEALTH TELEMETRY
              </span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                Hardware & Edge ML // Cheri Band
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Live sEMG Bio-Waveform Oscilloscope & Smart Home Trigger */}
            <div className="lg:col-span-7">
              <SemgOscilloscope />
            </div>

            {/* Right: Hardware Prototype Specs & Edge TinyML details */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c0c16] to-black p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#7ee8ff]">
                    Wearable Hardware Architecture
                  </span>
                  <span className="rounded-full bg-[#7ee8ff]/10 border border-[#7ee8ff]/30 px-2 py-0.5 text-[9px] font-mono text-[#7ee8ff]">
                    Dual-Engine
                  </span>
                </div>

                <h4 className="text-xl font-bold text-white mt-3 uppercase tracking-tight">
                  Cheri Band
                </h4>
                <p className="text-[11px] font-mono uppercase tracking-wider text-[#ff2fb9] mt-0.5 font-bold">
                  Hand Gesture Smart Home Band & Health Tracker
                </p>

                <p className="mt-2.5 text-[13px] leading-relaxed text-white/70">
                  A dual-purpose smart wearable combining micro-voltage surface electromyography (sEMG) for intuitive smart home hand gesture control with continuous biometric vital signs and health telemetry.
                </p>

                <div className="mt-4 space-y-2.5 text-[11px] font-mono text-white/80">
                  <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                    <span className="text-white/60">Smart Home Engine:</span>
                    <span className="text-[#7ee8ff] font-bold">Lights, AC, Media, Locks</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                    <span className="text-white/60">Health Tracker:</span>
                    <span className="text-[#ff2fb9] font-bold">Continuous HR & Vital Telemetry</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                    <span className="text-white/60">Sensor Suite:</span>
                    <span className="text-white font-bold">24-bit sEMG + 6-DoF IMU</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                    <span className="text-white/60">Edge Inference:</span>
                    <span className="text-emerald-400 font-bold">On-Device Quantized TinyML</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff2fb9] font-bold">
                  Simultaneous Control & Wellness
                </span>
                <p className="mt-1 text-xs text-white/60 leading-relaxed">
                  Controls your entire ambient living environment with subtle finger pinches and rotations while passively tracking neuromuscular activation fatigue, heart rate dynamics, and daily biometric health.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Banner */}
      <div className="mt-24 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-[32px] border border-white/10 bg-gradient-to-r from-[#7ee8ff]/10 via-[#0a0a14] to-[#ff2fb9]/10 p-8 sm:p-10 backdrop-blur-2xl">
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#ff2fb9] font-bold">
            Full-Stack • Automation • Edge ML Hardware
          </span>
          <h3 className="text-2xl sm:text-3xl font-black uppercase text-white">
            Ready to engineer your next system?
          </h3>
        </div>

        <a
          id="contact"
          href="mailto:contact@example.com"
          className="group inline-flex items-center gap-3 rounded-2xl bg-white px-7 py-3.5 text-[11px] font-black uppercase tracking-[0.25em] text-black shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all hover:bg-[#7ee8ff] hover:shadow-[0_0_40px_#7ee8ff] active:scale-95"
        >
          <span>Get in touch</span>
          <ArrowUpRight className="h-4 w-4 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </section>
  );
}

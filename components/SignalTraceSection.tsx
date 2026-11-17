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

// Live simulated sEMG bio-signal oscilloscope for Kiwi Gesture Band
function SemgOscilloscope() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeGesture, setActiveGesture] = useState<string>("PINCH_INDEX");
  const [confidence, setConfidence] = useState<number>(98.6);

  useEffect(() => {
    const gestures = [
      { name: "PINCH_INDEX", conf: 98.4 },
      { name: "FIST_CLENCH", conf: 99.1 },
      { name: "SWIPE_RIGHT", conf: 97.8 },
      { name: "WRIST_EXTENSION", conf: 98.9 },
      { name: "DOUBLE_TAP", conf: 99.4 },
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % gestures.length;
      setActiveGesture(gestures[idx].name);
      setConfidence(gestures[idx].conf);
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
            CH1: Forearm Extensor Carpi Radialis
          </span>
        </div>
        <span className="text-[#7ee8ff] font-bold">1000 Hz / 24-bit ADC</span>
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
        <div className="absolute top-2 right-2 flex items-center gap-2 rounded-lg border border-[#ff2fb9]/40 bg-black/80 px-2.5 py-1 backdrop-blur-md">
          <Brain className="h-3 w-3 text-[#ff2fb9]" />
          <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
            {activeGesture}
          </span>
          <span className="rounded bg-[#ff2fb9]/20 px-1.5 py-0.5 text-[9px] font-mono text-[#ff2fb9]">
            {confidence}%
          </span>
        </div>

        <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[9px] font-mono text-white/50">
          <span>Range: ±150 µV</span>
          <span>IMU: 6-DoF 200Hz</span>
          <span className="text-emerald-400">BLE 5.2 Connected</span>
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
        {/* CHECKPOINT 2: Automation & AI Systems (n8n / Shopify / WhatsApp) */}
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
                CHECKPOINT 02 // DATA PACKETS PULSING
              </span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                Automation & AI Systems
              </h3>
            </div>
          </div>

          {/* Interactive Automation Network Card */}
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#0a0a16] via-[#06060e] to-black p-6 sm:p-10 backdrop-blur-2xl">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ff2fb9]">
                  Multi-Channel Agentic Workflows
                </span>
                <p className="mt-1 text-sm text-white/70">
                  Orchestrating event-driven webhooks, WhatsApp conversational engines, Shopify automated fulfillments, and fine-tuned NLP pipelines.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-mono text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Pipelines Active: 99.98% SLA</span>
              </div>
            </div>

            {/* Visual Node Circuit with Traveling Data Packets */}
            <div className="relative my-8 py-6 px-4 rounded-2xl bg-black/60 border border-white/10 overflow-hidden">
              {/* Background Circuit Grid */}
              <div className="pointer-events-none absolute inset-0 opacity-15">
                <div className="h-full w-full bg-[radial-gradient(#ff2fb9_1px,transparent_1px)] [background-size:16px_16px]" />
              </div>

              {/* Service Pipeline Nodes Flow */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* Node A: Shopify Webhook */}
                <div className="flex flex-col items-center text-center p-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] mb-2">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                    Shopify Event
                  </span>
                  <span className="text-[9px] font-mono text-white/50 mt-0.5">
                    Order Ingestion Webhook
                  </span>
                </div>

                {/* Node B: n8n / Make Engine */}
                <div className="flex flex-col items-center text-center p-4 rounded-xl border border-[#ff2fb9]/40 bg-[#ff2fb9]/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,47,185,0.15)]">
                  <div className="h-10 w-10 rounded-xl bg-[#ff2fb9]/30 border border-[#ff2fb9] flex items-center justify-center text-[#ff2fb9] shadow-[0_0_20px_#ff2fb9] mb-2">
                    <Workflow className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                    n8n / Make Engine
                  </span>
                  <span className="text-[9px] font-mono text-[#ff2fb9] mt-0.5">
                    Async State & Router
                  </span>
                </div>

                {/* Node C: NLP Fine-Tuning */}
                <div className="flex flex-col items-center text-center p-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
                  <div className="h-10 w-10 rounded-xl bg-[#7ee8ff]/20 border border-[#7ee8ff]/40 flex items-center justify-center text-[#7ee8ff] shadow-[0_0_15px_rgba(126,232,255,0.3)] mb-2">
                    <Brain className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                    NLP Fine-Tuning
                  </span>
                  <span className="text-[9px] font-mono text-[#7ee8ff] mt-0.5">
                    Intent & Sentiment AI
                  </span>
                </div>

                {/* Node D: WhatsApp / Customer API */}
                <div className="flex flex-col items-center text-center p-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md">
                  <div className="h-10 w-10 rounded-xl bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] mb-2">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                    WhatsApp Cloud
                  </span>
                  <span className="text-[9px] font-mono text-white/50 mt-0.5">
                    Real-Time Dispatch
                  </span>
                </div>
              </div>

              {/* Data Packet Pulse SVG Bar */}
              <div className="relative mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-[10px] font-mono text-white/50 mb-2">
                  <span className="flex items-center gap-1.5 text-[#ff2fb9]">
                    <Zap className="h-3 w-3" />
                    LIVE PACKET STREAM: payload.json [2.4 KB]
                  </span>
                  <span>LATENCY: 84ms</span>
                </div>

                {/* Animated progress track with moving data packets */}
                <div className="relative h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.2,
                      ease: "linear",
                    }}
                    className="h-full w-48 rounded-full bg-gradient-to-r from-transparent via-[#ff2fb9] to-transparent shadow-[0_0_12px_#ff2fb9]"
                  />
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.2,
                      delay: 1.1,
                      ease: "linear",
                    }}
                    className="h-full w-36 rounded-full bg-gradient-to-r from-transparent via-[#7ee8ff] to-transparent shadow-[0_0_12px_#7ee8ff]"
                  />
                </div>
              </div>
            </div>

            {/* Architecture Details Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <span className="text-xl font-black text-white">n8n & Make</span>
                <p className="text-[10px] font-mono text-white/50 mt-1 uppercase">Workflow Orchestration</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <span className="text-xl font-black text-[#ff2fb9]">WhatsApp API</span>
                <p className="text-[10px] font-mono text-white/50 mt-1 uppercase">Meta Cloud Platform</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <span className="text-xl font-black text-[#7ee8ff]">NLP Models</span>
                <p className="text-[10px] font-mono text-white/50 mt-1 uppercase">Fine-Tuned Embeddings</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <span className="text-xl font-black text-emerald-400">&lt; 100ms</span>
                <p className="text-[10px] font-mono text-white/50 mt-1 uppercase">Webhook Execution</p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CHECKPOINT 3: Hardware & Edge ML (Kiwi sEMG / IMU Gesture Band) */}
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
                CHECKPOINT 03 // LIVE sEMG WAVEFORM MORPH
              </span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                Hardware & Edge ML // Kiwi Gesture Band
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Live sEMG Bio-Waveform Oscilloscope (Morphed from straight trace) */}
            <div className="lg:col-span-7">
              <SemgOscilloscope />
            </div>

            {/* Right: Hardware Prototype Specs & Edge TinyML details */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c0c16] to-black p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#7ee8ff]">
                    Embedded Sensor Architecture
                  </span>
                  <span className="rounded-full bg-[#7ee8ff]/10 border border-[#7ee8ff]/30 px-2 py-0.5 text-[9px] font-mono text-[#7ee8ff]">
                    BLE 5.2
                  </span>
                </div>

                <h4 className="text-xl font-bold text-white mt-3 uppercase tracking-tight">
                  Kiwi sEMG & IMU Wristband
                </h4>

                <p className="mt-2 text-[13px] leading-relaxed text-white/70">
                  Wearable neural-interface prototype acquiring micro-voltage surface electromyography (sEMG) from forearm musculature coupled with 6-DoF inertial motion tracking.
                </p>

                <div className="mt-4 space-y-2.5 text-[11px] font-mono text-white/80">
                  <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                    <span className="text-white/60">Analog Front-End:</span>
                    <span className="text-[#7ee8ff] font-bold">24-bit sEMG ADC (1kHz)</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                    <span className="text-white/60">Motion Tracking:</span>
                    <span className="text-[#ff2fb9] font-bold">6-Axis IMU (Gyro + Accel)</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                    <span className="text-white/60">On-Device Inference:</span>
                    <span className="text-emerald-400 font-bold">Quantized 1D-CNN (TinyML)</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                    <span className="text-white/60">Gesture Latency:</span>
                    <span className="text-white font-bold">&lt; 16ms (Instantaneous)</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff2fb9] font-bold">
                  Gesture Recognition Spectrum
                </span>
                <p className="mt-1 text-xs text-white/60 leading-relaxed">
                  Real-time pattern classification recognizes subtle finger pinches, fist contractions, hand waves, and continuous wrist rotation vectors with &gt; 98% accuracy.
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

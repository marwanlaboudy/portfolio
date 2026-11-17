"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useVelocity,
} from "framer-motion";
import { ExternalLink, ArrowUpRight } from "lucide-react";

export default function PinnedTelemetryDeck() {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Scroll Position & Velocity Tracking across the 300vh pinned stage
  const { scrollY, scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 350 });

  // Velocity-driven physical card tilt
  const cardVelocityTilt = useTransform(smoothVelocity, [-2500, 2500], [-3.5, 3.5]);

  // Horizontal scrub translation from 4% to -72%
  const rawDeckX = useTransform(scrollYProgress, [0, 1], ["4%", "-72%"]);
  const smoothDeckX = useSpring(rawDeckX, {
    stiffness: 220,
    damping: 38,
  });

  // Opposite half-speed parallax watermark
  const watermarkX = useTransform(scrollYProgress, [0, 1], ["0%", "32%"]);

  return (
    <section
      ref={containerRef}
      className="relative h-[300vh] w-full bg-[#07070a] border-t border-white/10"
    >
      {/* Sticky 100vh Viewport Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center select-none">
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
              PINNED HORIZONTAL SCROLL JACK [4 SYSTEMS]
            </span>
          </div>
        </div>

        {/* Horizontally Translating Cards Row */}
        <motion.div
          style={{ x: smoothDeckX, willChange: "transform" }}
          className="flex gap-8 px-6 sm:px-12 w-max items-center"
        >
          {/* Card 01: RE-SAPORI */}
          <motion.div
            style={{ rotate: cardVelocityTilt }}
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="group relative flex h-[520px] w-[86vw] sm:w-[48vw] lg:w-[40vw] flex-col justify-between overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-b from-[#0e0e1a] via-[#090912] to-[#07070a] p-8 sm:p-10 backdrop-blur-2xl transition-all duration-300 hover:border-[#22d3ee]/90 hover:shadow-[0_0_55px_rgba(34,211,238,0.25)]"
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

              <h3 className="mt-6 text-3xl sm:text-4xl font-black uppercase text-white tracking-tight group-hover:text-[#22d3ee] transition-colors">
                Re-Sapori
              </h3>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                Italian culinary digital platform engineered with Next.js 16 App Router, Turbopack, and reactive reservation UX.
              </p>

              <div className="mt-6 space-y-2.5 text-xs font-mono text-white/70">
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Performance TTFB:</span>
                  <span className="text-[#22d3ee] font-bold">&lt; 180ms</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Core Web Vitals:</span>
                  <span className="text-emerald-400 font-bold">99.8%</span>
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
            style={{ rotate: cardVelocityTilt }}
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="group relative flex h-[520px] w-[86vw] sm:w-[48vw] lg:w-[40vw] flex-col justify-between overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-b from-[#0e0e1a] via-[#090912] to-[#07070a] p-8 sm:p-10 backdrop-blur-2xl transition-all duration-300 hover:border-[#ec4899]/90 hover:shadow-[0_0_55px_rgba(236,72,153,0.25)]"
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

              <h3 className="mt-6 text-3xl sm:text-4xl font-black uppercase text-white tracking-tight group-hover:text-[#ec4899] transition-colors">
                Mario Juice
              </h3>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                Fresh beverage brand storefront with high-conversion mobile filtering, reactive cart engine, and bold design system.
              </p>

              <div className="mt-6 space-y-2.5 text-xs font-mono text-white/70">
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Checkout Conversion:</span>
                  <span className="text-[#ec4899] font-bold">+34% Lift</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Mobile First:</span>
                  <span className="text-emerald-400 font-bold">100% Responsive</span>
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
            style={{ rotate: cardVelocityTilt }}
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="group relative flex h-[520px] w-[86vw] sm:w-[48vw] lg:w-[40vw] flex-col justify-between overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-b from-[#0e0e1a] via-[#090912] to-[#07070a] p-8 sm:p-10 backdrop-blur-2xl transition-all duration-300 hover:border-[#22d3ee]/90 hover:shadow-[0_0_55px_rgba(34,211,238,0.25)]"
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

              <h3 className="mt-6 text-3xl sm:text-4xl font-black uppercase text-white tracking-tight group-hover:text-[#22d3ee] transition-colors">
                Kiwi Band
              </h3>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                ESP32 wearable gesture bracelet combining differential sEMG muscle potentials with 6-axis IMU tracking for sub-14ms gesture classification.
              </p>

              <div className="mt-6 space-y-2.5 text-xs font-mono text-white/70">
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Hardware:</span>
                  <span className="text-[#22d3ee] font-bold">ESP32-S3 Dual-Core</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Sampling Rate:</span>
                  <span className="text-white font-bold">1 kHz ADC + 200 Hz IMU</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Inference Model:</span>
                  <span className="text-emerald-400 font-bold">Quantized 1D-CNN</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-xs font-mono text-white/70">BLE 5.2 Direct</span>
              <span className="text-[10px] font-mono text-[#22d3ee] font-bold">Low Latency</span>
            </div>
          </motion.div>

          {/* Card 04: N8N ENGINE */}
          <motion.div
            style={{ rotate: cardVelocityTilt }}
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="group relative flex h-[520px] w-[86vw] sm:w-[48vw] lg:w-[40vw] flex-col justify-between overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-b from-[#0e0e1a] via-[#090912] to-[#07070a] p-8 sm:p-10 backdrop-blur-2xl transition-all duration-300 hover:border-[#ec4899]/90 hover:shadow-[0_0_55px_rgba(236,72,153,0.25)]"
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

              <h3 className="mt-6 text-3xl sm:text-4xl font-black uppercase text-white tracking-tight group-hover:text-[#ec4899] transition-colors">
                Autonomous Engine
              </h3>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                Multi-channel event orchestration linking Shopify webhooks, n8n async core, and Qwen3.5/AraBERT NLP models on WhatsApp Cloud.
              </p>

              <div className="mt-6 space-y-2.5 text-xs font-mono text-white/70">
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Throughput:</span>
                  <span className="text-[#ec4899] font-bold">10k+ events/day</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>NLP Models:</span>
                  <span className="text-white font-bold">Qwen3.5 + AraBERT</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Uptime:</span>
                  <span className="text-emerald-400 font-bold">99.98% SLA</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-xs font-mono text-white/70">Zero-Touch Automation</span>
              <span className="text-[10px] font-mono text-[#ec4899] font-bold">Autonomous</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useVelocity,
} from "framer-motion";
import { ExternalLink, ArrowUpRight, Target, Video, Flame } from "lucide-react";

export default function PinnedTelemetryDeck() {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Scroll Position & Velocity Tracking across the 320vh pinned stage
  const { scrollY, scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 350 });

  // Velocity-driven physical card tilt
  const cardVelocityTilt = useTransform(smoothVelocity, [-2500, 2500], [-3.5, 3.5]);

  // Horizontal scrub translation from 2% to -81% to accommodate all 5 cards
  const rawDeckX = useTransform(scrollYProgress, [0, 1], ["2%", "-81%"]);
  const smoothDeckX = useSpring(rawDeckX, {
    stiffness: 220,
    damping: 38,
  });

  // Opposite half-speed parallax watermark
  const watermarkX = useTransform(scrollYProgress, [0, 1], ["0%", "36%"]);

  return (
    <section
      ref={containerRef}
      className="relative h-[320vh] w-full bg-[#07070a] border-t border-white/10"
    >
      {/* Sticky 100vh Viewport Stage */}
      <div className="sticky top-0 h-screen min-h-screen h-[100dvh] w-full bg-[#07070a] overflow-hidden flex flex-col justify-center select-none">
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
              PINNED HORIZONTAL SCROLL JACK [5 SYSTEMS]
            </span>
          </div>
        </div>

        {/* Horizontally Translating Cards Row (5 Distinct Systems) */}
        <motion.div
          style={{ x: smoothDeckX, willChange: "transform" }}
          className="flex gap-8 px-6 sm:px-12 w-max items-center"
        >
          {/* Card 01: FULL-STACK WEBSITES (Re-Sapori, Mario Juice, Elhuq) */}
          <motion.div
            style={{ rotate: cardVelocityTilt }}
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="group relative flex h-[520px] w-[86vw] sm:w-[48vw] lg:w-[40vw] flex-col justify-between overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-b from-[#0e0e1a] via-[#090912] to-[#07070a] p-8 sm:p-10 backdrop-blur-2xl transition-all duration-300 hover:border-[#22d3ee]/90 hover:shadow-[0_0_55px_rgba(34,211,238,0.25)]"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-xs font-bold text-[#22d3ee] uppercase tracking-widest">
                  01 // FULL-STACK WEBSITES
                </span>
                <span className="rounded-full bg-emerald-400/10 border border-emerald-400/30 px-2.5 py-0.5 text-[9px] font-mono text-emerald-300">
                  3 Production Platforms
                </span>
              </div>

              <h3 className="mt-6 text-3xl sm:text-4xl font-black uppercase text-white tracking-tight group-hover:text-[#22d3ee] transition-colors">
                Web Architectures
              </h3>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                Full-stack Next.js production platforms: <strong>Re-Sapori</strong> (Italian culinary ordering UX), <strong>Mario Juice</strong> (Beverage brand storefront), and <strong>Elhuq</strong> (Luxury Dar Monasbat venue in Oman).
              </p>

              <div className="mt-6 space-y-2 text-xs font-mono text-white/70">
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Re-Sapori:</span>
                  <a href="https://resapori.com" target="_blank" rel="noopener noreferrer" className="text-[#22d3ee] hover:underline font-bold">
                    resapori.com ↗
                  </a>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Mario Juice:</span>
                  <a href="https://mariojuice.com" target="_blank" rel="noopener noreferrer" className="text-[#ec4899] hover:underline">
                    mariojuice.com ↗
                  </a>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Elhuq (Dar Monasbat Oman):</span>
                  <a href="https://elhuq.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
                    elhuq.com ↗
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-mono">
              <span className="text-white/60">Next.js 16 • Turbopack • SSR</span>
              <span className="text-[#22d3ee] font-bold">100% Responsive</span>
            </div>
          </motion.div>

          {/* Card 02: MEDIA BUYING & ADS (Re-Sapori Pizza Food Truck) */}
          <motion.div
            style={{ rotate: cardVelocityTilt }}
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="group relative flex h-[520px] w-[86vw] sm:w-[48vw] lg:w-[40vw] flex-col justify-between overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-b from-[#0e0e1a] via-[#090912] to-[#07070a] p-8 sm:p-10 backdrop-blur-2xl transition-all duration-300 hover:border-[#22d3ee]/90 hover:shadow-[0_0_55px_rgba(34,211,238,0.25)]"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-xs font-bold text-[#22d3ee] uppercase tracking-widest">
                  02 // MEDIA BUYING &amp; ADS
                </span>
                <span className="rounded-full bg-emerald-400/10 border border-emerald-400/30 px-2.5 py-0.5 text-[9px] font-mono text-emerald-300">
                  Re-Sapori Food Truck
                </span>
              </div>

              <h3 className="mt-6 text-3xl sm:text-4xl font-black uppercase text-white tracking-tight group-hover:text-[#22d3ee] transition-colors">
                Media Buying &amp; Ads
              </h3>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                Paid social advertising acquisition and cinematic content creation for the Re-Sapori pizza food truck. Managing Meta &amp; TikTok ad funnels and hyper-local dayparting to drive hungry food truck foot traffic.
              </p>

              <div className="mt-6 space-y-2.5 text-xs font-mono text-white/70">
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Ad Performance:</span>
                  <span className="text-emerald-400 font-bold">4.6x Blended ROAS</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Footfall Funnel:</span>
                  <span className="text-[#22d3ee] font-bold">5–8 km Hyper-Local Dayparting</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Creative Production:</span>
                  <span className="text-[#ec4899] font-bold">Short-Form Food Reels &amp; TikTok Ads</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-mono">
              <span className="text-white/60">Meta Ads • TikTok Ads • Creative</span>
              <span className="text-emerald-400 font-bold">+320% Footfall Growth</span>
            </div>
          </motion.div>

          {/* Card 03: MOUNTAIN VIEW AI CHATBOT */}
          <motion.div
            style={{ rotate: cardVelocityTilt }}
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="group relative flex h-[520px] w-[86vw] sm:w-[48vw] lg:w-[40vw] flex-col justify-between overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-b from-[#0e0e1a] via-[#090912] to-[#07070a] p-8 sm:p-10 backdrop-blur-2xl transition-all duration-300 hover:border-[#22d3ee]/90 hover:shadow-[0_0_55px_rgba(34,211,238,0.25)]"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-xs font-bold text-[#22d3ee] uppercase tracking-widest">
                  03 // MOUNTAIN VIEW BOT
                </span>
                <span className="rounded-full bg-[#22d3ee]/10 border border-[#22d3ee]/30 px-2.5 py-0.5 text-[9px] font-mono text-[#22d3ee]">
                  Video Demo Ready
                </span>
              </div>

              <h3 className="mt-6 text-3xl sm:text-4xl font-black uppercase text-white tracking-tight group-hover:text-[#22d3ee] transition-colors">
                Mountain View Chatbot
              </h3>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                Automated Facebook lead scraper that extracts high-intent buyers and texts them via conversational AI to qualify interest and book viewing appointments.
              </p>

              <div className="mt-6 space-y-2.5 text-xs font-mono text-white/70">
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Lead Pipeline:</span>
                  <span className="text-emerald-400 font-bold">Facebook Auto-Scraping</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Follow-Up:</span>
                  <span className="text-[#22d3ee] font-bold">Conversational SMS/WhatsApp</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Media Demo:</span>
                  <span className="text-white">Embedded Video Slot Included</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-mono">
              <span className="text-white/60">Enterprise Real Estate Test</span>
              <span className="text-[#22d3ee] font-bold">&lt; 30s Lead Outreach</span>
            </div>
          </motion.div>

          {/* Card 04: AUTONOMOUS DROPSHIPPING & N8N */}
          <motion.div
            style={{ rotate: cardVelocityTilt }}
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="group relative flex h-[520px] w-[86vw] sm:w-[48vw] lg:w-[40vw] flex-col justify-between overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-b from-[#0e0e1a] via-[#090912] to-[#07070a] p-8 sm:p-10 backdrop-blur-2xl transition-all duration-300 hover:border-[#ec4899]/90 hover:shadow-[0_0_55px_rgba(236,72,153,0.25)]"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-xs font-bold text-[#ec4899] uppercase tracking-widest">
                  04 // DROPSHIPPING &amp; N8N
                </span>
                <span className="rounded-full bg-[#ec4899]/10 border border-[#ec4899]/30 px-2.5 py-0.5 text-[9px] font-mono text-[#ec4899]">
                  100% Automated
                </span>
              </div>

              <h3 className="mt-6 text-3xl sm:text-4xl font-black uppercase text-white tracking-tight group-hover:text-[#ec4899] transition-colors">
                Autonomous Dropshipping
              </h3>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                Self-driving e-commerce pipeline that discovers daily best-sellers, generates dedicated landing pages, creates ads, and automatically fulfills customer orders.
              </p>

              <div className="mt-6 space-y-2.5 text-xs font-mono text-white/70">
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Product Hunting:</span>
                  <span className="text-[#ec4899] font-bold">Daily Winner Scraper</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Creation:</span>
                  <span className="text-white font-bold">Auto Landing Page &amp; Ads</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Fulfillment:</span>
                  <span className="text-emerald-400 font-bold">Zero-Touch Supplier Buy</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <a
                href="https://n8n.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#ec4899] hover:underline"
              >
                <span>View n8n Automations</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <span className="text-[10px] font-mono text-white/40">n8n Workflow Link</span>
            </div>
          </motion.div>

          {/* Card 05: CHERI BAND (GESTURE & HEALTH) */}
          <motion.div
            style={{ rotate: cardVelocityTilt }}
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="group relative flex h-[520px] w-[86vw] sm:w-[48vw] lg:w-[40vw] flex-col justify-between overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-b from-[#0e0e1a] via-[#090912] to-[#07070a] p-8 sm:p-10 backdrop-blur-2xl transition-all duration-300 hover:border-[#22d3ee]/90 hover:shadow-[0_0_55px_rgba(34,211,238,0.25)]"
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-xs font-bold text-[#22d3ee] uppercase tracking-widest">
                  05 // CHERI BAND
                </span>
                <span className="rounded-full bg-[#22d3ee]/10 border border-[#22d3ee]/30 px-2.5 py-0.5 text-[9px] font-mono text-[#22d3ee]">
                  Dual-Engine
                </span>
              </div>

              <h3 className="mt-6 text-3xl sm:text-4xl font-black uppercase text-white tracking-tight group-hover:text-[#22d3ee] transition-colors">
                Cheri Band
              </h3>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                Smart home hand gesture bracelet (controlling lights, AC, volume, media, locks) combined with real-time continuous health and biometric vital signs tracking.
              </p>

              <div className="mt-6 space-y-2.5 text-xs font-mono text-white/70">
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Smart Home:</span>
                  <span className="text-[#22d3ee] font-bold">Contactless Micro-Gestures</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Health Tracker:</span>
                  <span className="text-[#ec4899] font-bold">HR, sEMG Tone &amp; Vitals</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Edge Architecture:</span>
                  <span className="text-emerald-400 font-bold">TinyML CNN &lt; 14ms</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-xs font-mono text-white/70">BLE 5.2 Direct</span>
              <span className="text-[10px] font-mono text-[#22d3ee] font-bold">Smart Home &amp; Health</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

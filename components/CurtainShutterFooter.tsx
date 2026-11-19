"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

// Magnetic cursor-following button
function MagneticPillButton() {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 260, damping: 20 });
  const springY = useSpring(y, { stiffness: 260, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.4);
    y.set((e.clientY - centerY) * 0.4);
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
      className="group relative inline-flex items-center gap-3.5 rounded-full border-2 border-[#07070a] bg-[#07070a] px-9 py-5 text-xs font-mono font-black uppercase tracking-[0.3em] text-white shadow-[0_0_50px_rgba(7,7,10,0.6)] transition-all duration-300 hover:scale-105 hover:bg-white hover:text-[#07070a] hover:border-white active:scale-95"
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

export default function CurtainShutterFooter() {
  return (
    <footer className="sticky bottom-0 z-0 h-[85dvh] w-full overflow-hidden bg-gradient-to-br from-cyan-400 via-sky-400 to-pink-500 text-[#07070a] flex flex-col justify-between">
      {/* Infinite Kinetic Marquee */}
      <div className="relative overflow-hidden border-b-2 border-[#07070a]/20 py-3 sm:py-4 bg-black/10 backdrop-blur-sm select-none">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            duration: 16,
            ease: "linear",
          }}
          className="flex w-max whitespace-nowrap text-xs sm:text-sm font-mono font-black uppercase tracking-[0.25em] sm:tracking-[0.35em] text-[#07070a]"
        >
          <span className="px-6">
            LET&apos;S BUILD SOMETHING ICONIC ✦ FULL-STACK • AI • HARDWARE ✦
          </span>
          <span className="px-6">
            LET&apos;S BUILD SOMETHING ICONIC ✦ FULL-STACK • AI • HARDWARE ✦
          </span>
          <span className="px-6">
            LET&apos;S BUILD SOMETHING ICONIC ✦ FULL-STACK • AI • HARDWARE ✦
          </span>
          <span className="px-6">
            LET&apos;S BUILD SOMETHING ICONIC ✦ FULL-STACK • AI • HARDWARE ✦
          </span>
        </motion.div>
      </div>

      {/* Main High-Contrast Curtain Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-12 flex flex-col items-center text-center my-auto">
        <span className="rounded-full border-2 border-[#07070a] bg-[#07070a]/10 px-4 sm:px-5 py-1.5 sm:py-2 text-[9px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.2em] sm:tracking-[0.35em] text-[#07070a]">
          ✦ MECHANICAL SHUTTER REVEAL // 2026 ARCHIVE
        </span>

        <h2 className="mt-5 sm:mt-8 text-3xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tight text-[#07070a] max-w-4xl leading-[0.92]">
          LET&apos;S BUILD SOMETHING ICONIC
        </h2>

        <p className="mt-3 sm:mt-4 max-w-xl text-xs sm:text-base font-medium leading-relaxed text-[#07070a]/80">
          Available for full-stack platforms, autonomous multi-agent pipelines, and embedded biomedical edge ML architecture.
        </p>

        {/* Magnetic Cursor-Following Button */}
        <div className="mt-6 sm:mt-10">
          <MagneticPillButton />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full border-t border-[#07070a]/20 px-4 sm:px-6 py-4 sm:py-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.18em] sm:tracking-[0.25em] text-[#07070a]/70">
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
  );
}

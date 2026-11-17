"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import FaceLooker from "@/components/FaceLooker";
import ResaporiPhoneTrigger from "@/components/ResaporiPhoneTrigger";
import MarioJuicePhoneTrigger from "@/components/MarioJuicePhoneTrigger";
import { ArrowRight, ChevronDown, Mail } from "lucide-react";

export default function HeroWithKineticSplit() {
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();

  // Kinetic Typography Split: "MARWAN" slides left, "LABOUDY" slides right on scroll
  const titleLeftX = useTransform(scrollY, [0, 500], ["0%", "-55%"]);
  const titleRightX = useTransform(scrollY, [0, 500], ["0%", "+55%"]);
  const titleOpacity = useTransform(scrollY, [0, 450], [1, 0.15]);

  return (
    <section
      ref={heroRef}
      className="relative z-10 mx-auto flex min-h-screen w-full flex-col items-center justify-between px-6 pb-12 pt-6"
    >
      {/* Glowy Neon Re Sapori Phone Trigger in middle-left of first page */}
      <ResaporiPhoneTrigger />

      {/* Glowy Neon Mario Juice Phone Trigger in middle-right of first page */}
      <MarioJuicePhoneTrigger />

      {/* Top bar */}
      <header className="relative z-20 flex w-full max-w-7xl items-center justify-between text-[11px] uppercase tracking-[0.35em] text-white/80">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#7ee8ff] shadow-[0_0_8px_#7ee8ff]" />
          <span>Marwan Laboudy</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="#experience"
            className="hidden sm:inline-block text-white/70 hover:text-[#7ee8ff] transition-colors"
          >
            Experience
          </a>
          <a
            href="#contact"
            className="text-[#ff2fb9] hover:text-[#7ee8ff] transition-colors font-bold"
          >
            Available for work
          </a>
        </div>
      </header>

      {/* Giant Typography with Kinetic Split (No bounding box) */}
      <div className="pointer-events-none absolute inset-x-0 top-[14%] z-0 select-none text-center font-black uppercase leading-[0.85] tracking-tight">
        <motion.span
          style={{ x: titleLeftX, opacity: titleOpacity }}
          className="block text-[clamp(3.5rem,13vw,11.5rem)] text-[#7ee8ff] drop-shadow-[0_0_40px_rgba(34,211,238,0.45)]"
        >
          Marwan
        </motion.span>
        <motion.span
          style={{ x: titleRightX, opacity: titleOpacity }}
          className="block text-[clamp(3.5rem,13vw,11.5rem)] text-[#ff2fb9] drop-shadow-[0_0_40px_rgba(255,47,185,0.5)]"
        >
          Laboudy
        </motion.span>
      </div>

      {/* Portrait: Completely frameless, transparent cutout (NO box, NO borders) */}
      <div className="relative z-10 mt-6 sm:mt-10 flex items-center justify-center pointer-events-auto">
        <FaceLooker size={640} className="max-w-[92vw]" />
      </div>

      {/* Scroll Call-To-Action (Face looks down with it) */}
      <div className="relative z-20 my-4 flex flex-col items-center gap-2.5">
        <a
          href="#experience"
          className="group relative inline-flex items-center gap-3 rounded-full border border-[#7ee8ff]/60 bg-black/85 px-6 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#7ee8ff] shadow-[0_0_20px_rgba(126,232,255,0.35),inset_0_0_12px_rgba(126,232,255,0.2)] backdrop-blur-xl transition-all duration-300 hover:border-[#ff2fb9] hover:text-[#ff2fb9] hover:shadow-[0_0_35px_rgba(255,47,185,0.6),inset_0_0_15px_rgba(255,47,185,0.3)] hover:scale-105 active:scale-95"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff2fb9] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#7ee8ff] group-hover:bg-[#ff2fb9] shadow-[0_0_8px_#7ee8ff]" />
          </span>
          <span>Scroll down to see the rest of my work</span>
          <ChevronDown className="h-4 w-4 animate-bounce text-[#ff2fb9] group-hover:text-[#7ee8ff]" />
        </a>
        <span className="text-[9px] uppercase tracking-[0.3em] text-white/40">
          Scroll Down to Explore Experience
        </span>
      </div>

      {/* Bottom row */}
      <div className="relative z-20 flex w-full max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/70 text-center sm:text-left">
          Where ideas meet <span className="text-[#ff2fb9]">interface</span>
        </p>
        <a
          id="contact"
          href="mailto:contact@example.com"
          className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.35em] text-white"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 transition-colors group-hover:border-[#22d3ee] group-hover:text-[#22d3ee]">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
          Get in touch
          <Mail className="h-3.5 w-3.5 text-[#7ee8ff]" />
        </a>
      </div>
    </section>
  );
}

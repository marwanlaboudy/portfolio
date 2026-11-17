"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import FaceLooker from "@/components/FaceLooker";
import ResaporiPhoneTrigger from "@/components/ResaporiPhoneTrigger";
import MarioJuicePhoneTrigger from "@/components/MarioJuicePhoneTrigger";
import { ArrowRight, Mail } from "lucide-react";

export default function HeroWithKineticSplit() {
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();

  // Kinetic Typography Split: "MARWAN" slides left, "LABOUDY" slides right on scroll
  // Expanded scroll range so the text sliding takes much more scroll time and distance
  const titleLeftX = useTransform(scrollY, [0, 1400], ["0%", "-75%"]);
  const titleRightX = useTransform(scrollY, [0, 1400], ["0%", "+75%"]);
  const titleOpacity = useTransform(scrollY, [0, 900, 1500], [1, 0.9, 0.15]);

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
        {/* Lando Norris style logo lockup: MARWAN (Didone Serif) stacked over LABOUDY (Heavy Sans) */}
        <a
          href="#top"
          className="group flex flex-col leading-[0.82] select-none text-left transition-transform duration-200 hover:opacity-90 active:scale-95"
          title="Marwan Laboudy"
        >
          <span className="font-logo-serif text-[22px] sm:text-[26px] font-black uppercase text-white tracking-tight">
            Marwan
          </span>
          <span className="font-logo-sans text-[18.5px] sm:text-[22px] font-black uppercase text-white tracking-[-0.025em]">
            Laboudy
          </span>
        </a>
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

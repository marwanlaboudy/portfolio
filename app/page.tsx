import FaceLooker from "@/components/FaceLooker";
import ResaporiPhoneTrigger from "@/components/ResaporiPhoneTrigger";
import MarioJuicePhoneTrigger from "@/components/MarioJuicePhoneTrigger";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ExternalLink,
  Mail,
  Sparkles,
  Smartphone,
  Layers,
  ArrowUp,
} from "lucide-react";

export default function Home() {
  return (
    <main id="top" className="relative min-h-screen overflow-x-hidden bg-black text-white selection:bg-[#ff2fb9] selection:text-white">
      {/* Background ambient neon glows */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-40 top-1/4 h-[38rem] w-[38rem] rounded-full bg-[#22d3ee]/15 blur-[170px]" />
        <div className="absolute -right-40 top-1/3 h-[38rem] w-[38rem] rounded-full bg-[#ff2fb9]/20 blur-[170px]" />
        <div className="absolute left-1/3 bottom-10 h-[30rem] w-[30rem] rounded-full bg-[#7ee8ff]/10 blur-[180px]" />
      </div>

      {/* Glowy Neon Re Sapori Phone Trigger & Preview on the Left */}
      <ResaporiPhoneTrigger />

      {/* Glowy Neon Mario Juice Phone Trigger & Preview on the Right */}
      <MarioJuicePhoneTrigger />

      {/* Top bar */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-[11px] uppercase tracking-[0.35em] text-white/80">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#7ee8ff] shadow-[0_0_8px_#7ee8ff]" />
          <span>Marwan Laboudy</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="#work"
            className="hidden sm:inline-block text-white/70 hover:text-[#7ee8ff] transition-colors"
          >
            Selected Work
          </a>
          <a
            href="#contact"
            className="text-[#ff2fb9] hover:text-[#7ee8ff] transition-colors font-bold"
          >
            Available for work
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl flex-col items-center justify-between px-6 pb-12 pt-4">
        {/* Giant title behind the face */}
        <h1 className="pointer-events-none absolute inset-x-0 top-[12%] z-0 select-none text-center font-black uppercase leading-[0.85] tracking-tight">
          <span className="block text-[clamp(3.5rem,13vw,11.5rem)] text-[#7ee8ff] drop-shadow-[0_0_40px_rgba(34,211,238,0.45)]">
            Marwan
          </span>
          <span className="block text-[clamp(3.5rem,13vw,11.5rem)] text-[#ff2fb9] drop-shadow-[0_0_40px_rgba(255,47,185,0.5)]">
            Laboudy
          </span>
        </h1>

        {/* Big centered portrait (no frame) */}
        <div className="relative z-10 mt-6 sm:mt-10">
          <FaceLooker size={640} className="max-w-[92vw]" />
        </div>

        {/* Scroll Call-To-Action (Face looks down with it) */}
        <div className="relative z-20 my-4 flex flex-col items-center gap-3">
          <a
            href="#work"
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
            Interactive Gaze Tracks Your Scroll
          </span>
        </div>

        {/* Bottom row */}
        <div className="relative z-20 flex w-full flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
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

      {/* Selected Work Section (Target of the scroll-down gaze) */}
      <section id="work" className="relative z-20 mx-auto max-w-7xl px-6 py-28">
        <div className="mb-16 flex flex-col items-start gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7ee8ff]/30 bg-[#7ee8ff]/10 px-3.5 py-1 text-[10px] font-mono uppercase tracking-[0.3em] text-[#7ee8ff]">
            <Sparkles className="h-3 w-3 text-[#ff2fb9]" />
            <span>01 / Selected Work</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white">
            Featured <span className="text-[#ff2fb9] drop-shadow-[0_0_30px_rgba(255,47,185,0.4)]">Projects</span>
          </h2>
          <p className="max-w-2xl text-[13px] leading-relaxed tracking-wider text-white/70">
            High-performance full-stack web architectures, interactive 3D interfaces, and responsive digital storefronts crafted with precision.
          </p>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Card 1: Re Sapori */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#07070d]/90 p-8 backdrop-blur-xl transition-all duration-300 hover:border-[#7ee8ff]/80 hover:shadow-[0_0_50px_rgba(126,232,255,0.25)]">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#7ee8ff]/10 blur-[80px] group-hover:bg-[#7ee8ff]/20 transition-all duration-500" />
            
            <div className="flex items-center justify-between pb-6">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#7ee8ff]">
                Restaurant & E-Commerce
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                Live Production
              </span>
            </div>

            <h3 className="text-3xl font-extrabold tracking-tight text-white group-hover:text-[#7ee8ff] transition-colors">
              Re Sapori
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed tracking-wide text-white/70">
              An Italian culinary digital experience featuring real-time menu browsing, mobile ordering, and fluid kinetic animations.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-wider text-white/60">
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Next.js 16</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">React 19</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Tailwind CSS</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Framer Motion</span>
            </div>

            <div className="mt-8 flex items-center gap-4 pt-4 border-t border-white/10">
              <a
                href="https://resapori.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#7ee8ff] px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-black shadow-[0_0_20px_rgba(126,232,255,0.4)] transition-all hover:bg-white hover:shadow-[0_0_30px_#7ee8ff]"
              >
                <span>Visit Site</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/50">
                <Smartphone className="h-3.5 w-3.5 text-[#ff2fb9]" />
                Use phone preview on left
              </span>
            </div>
          </div>

          {/* Card 2: Mario Juice */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#07070d]/90 p-8 backdrop-blur-xl transition-all duration-300 hover:border-[#ff2fb9]/80 hover:shadow-[0_0_50px_rgba(255,47,185,0.25)]">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#ff2fb9]/10 blur-[80px] group-hover:bg-[#ff2fb9]/20 transition-all duration-500" />
            
            <div className="flex items-center justify-between pb-6">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#ff2fb9]">
                Beverage Brand & Storefront
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                Live Production
              </span>
            </div>

            <h3 className="text-3xl font-extrabold tracking-tight text-white group-hover:text-[#ff2fb9] transition-colors">
              Mario Juice
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed tracking-wide text-white/70">
              Fresh and dynamic juice bar brand platform built with a mobile-first philosophy, vivid visuals, and high-conversion ordering UX.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-wider text-white/60">
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">App Router</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">TypeScript</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Modern UI</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Mobile First</span>
            </div>

            <div className="mt-8 flex items-center gap-4 pt-4 border-t border-white/10">
              <a
                href="https://mariojuice.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#ff2fb9] px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-black shadow-[0_0_20px_rgba(255,47,185,0.4)] transition-all hover:bg-white hover:shadow-[0_0_30px_#ff2fb9]"
              >
                <span>Visit Site</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white/50">
                <Smartphone className="h-3.5 w-3.5 text-[#7ee8ff]" />
                Use phone preview on right
              </span>
            </div>
          </div>
        </div>

        {/* Architecture & Engineering Capabilities Banner */}
        <div className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-r from-[#7ee8ff]/5 via-transparent to-[#ff2fb9]/5 p-8 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#7ee8ff] font-mono text-xs uppercase tracking-widest font-bold">
                <Layers className="h-4 w-4" />
                <span>Full-Stack Next.js</span>
              </div>
              <p className="text-[12px] text-white/60 leading-relaxed">
                App Router, Turbopack, React 19 Server Components, SSR, and API architectures built for maximum performance.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#ff2fb9] font-mono text-xs uppercase tracking-widest font-bold">
                <Sparkles className="h-4 w-4" />
                <span>Interactive Vision & Motion</span>
              </div>
              <p className="text-[12px] text-white/60 leading-relaxed">
                MediaPipe AI vision, 60fps canvas engines, spring physics, and kinetic interactions that bring interfaces to life.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-white font-mono text-xs uppercase tracking-widest font-bold">
                <ExternalLink className="h-4 w-4 text-[#7ee8ff]" />
                <span>Production Quality</span>
              </div>
              <p className="text-[12px] text-white/60 leading-relaxed">
                Clean TypeScript, responsive cross-device layouts, sub-second load times, and pixel-perfect design craft.
              </p>
            </div>
          </div>
        </div>

        {/* Back to top button */}
        <div className="mt-20 flex justify-center">
          <a
            href="#top"
            className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-[10px] font-mono uppercase tracking-[0.25em] text-white/70 hover:border-[#7ee8ff] hover:text-[#7ee8ff] transition-all"
          >
            <ArrowUp className="h-3 w-3 group-hover:-translate-y-0.5 transition-transform" />
            <span>Back to top</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/10 px-6 py-10 text-center text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">
        <p>© {new Date().getFullYear()} Marwan Laboudy. All rights reserved.</p>
      </footer>
    </main>
  );
}

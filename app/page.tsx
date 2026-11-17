import FaceLooker from "@/components/FaceLooker";
import { ArrowRight, Mail } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Neon glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-1/3 h-[34rem] w-[34rem] rounded-full bg-[#22d3ee]/20 blur-[160px]" />
        <div className="absolute -right-40 top-1/4 h-[34rem] w-[34rem] rounded-full bg-[#ff2fb9]/25 blur-[160px]" />
      </div>

      {/* Top bar */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-[11px] uppercase tracking-[0.35em] text-white/80">
        <span>Portfolio</span>
        <a href="#contact" className="text-[#ff2fb9] hover:text-[#7ee8ff] transition-colors">
          Available for work
        </a>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl flex-col items-center justify-center px-6 pb-16">
        {/* Giant title behind the face */}
        <h1 className="pointer-events-none absolute inset-x-0 top-[14%] z-0 select-none text-center font-black uppercase leading-[0.85] tracking-tight">
          <span className="block text-[clamp(3.5rem,13vw,11.5rem)] text-[#7ee8ff] drop-shadow-[0_0_40px_rgba(34,211,238,0.45)]">
            Marwan
          </span>
          <span className="block text-[clamp(3.5rem,13vw,11.5rem)] text-[#ff2fb9] drop-shadow-[0_0_40px_rgba(255,47,185,0.5)]">
            Laboudy
          </span>
        </h1>

        {/* Big centered portrait (no frame) */}
        <div className="relative z-10 mt-10">
          <FaceLooker size={640} className="max-w-[92vw]" />
        </div>

        {/* Bottom row */}
        <div className="relative z-20 -mt-6 flex w-full flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/70">
            Where ideas meet <span className="text-[#ff2fb9]">interface</span>
          </p>
          <a
            id="contact"
            href="mailto:contact@example.com"
            className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.35em] text-white"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 transition-colors group-hover:border-[#22d3ee] group-hover:text-[#22d3ee]">
              <ArrowRight className="h-4 w-4" />
            </span>
            Get in touch
            <Mail className="h-4 w-4 text-[#7ee8ff]" />
          </a>
        </div>
      </section>
    </main>
  );
}

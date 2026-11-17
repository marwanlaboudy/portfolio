import HeroWithKineticSplit from "@/components/HeroWithKineticSplit";
import SignalTraceSection from "@/components/SignalTraceSection";

export default function Home() {
  return (
    <main
      id="top"
      className="relative min-h-screen overflow-x-hidden bg-black text-white selection:bg-[#ff2fb9] selection:text-white"
    >
      {/* Background ambient cyberpunk lighting */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-[#7ee8ff]/10 blur-[150px]" />
        <div className="absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full bg-[#ff2fb9]/12 blur-[160px]" />
      </div>

      {/* 1. Hero Section:
          - Frameless gaze-tracking portrait with natural eye-blinking
          - Lando Norris style logo lockup in top-left header
          - Kinetic Typography Split ("MARWAN" left, "LABOUDY" right on scroll)
          - Middle-left & middle-right interactive smartphone triggers */}
      <HeroWithKineticSplit />

      {/* 2. Interactive "Signal Trace" SVG Line (Scroll 25% -> 75%+)
          Lando Norris inspired live neon cyan-to-magenta circuit/waveform trace:
          - Path Drawing: SVG circuit weaves down the viewport tied to scroll depth
          - Checkpoint 01: Web & Brand Architecture (Re-Sapori, Mario Juice, Cheri Band) with 3D Parallax Tilt
          - Checkpoint 02: Automation & AI Systems (n8n, Make, Shopify, WhatsApp Cloud, NLP fine-tuning) with pulsing data packets
          - Checkpoint 03: Hardware & Edge ML (Kiwi sEMG/IMU Gesture Band) where the trace morphs into a live simulated sEMG bio-signal waveform oscilloscope */}
      <SignalTraceSection />

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/10 px-6 py-10 text-center text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">
        <p>© {new Date().getFullYear()} Marwan Laboudy. All rights reserved.</p>
      </footer>
    </main>
  );
}

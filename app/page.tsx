import HeroPhysicalUnveil from "@/components/HeroPhysicalUnveil";
import KineticSignalTrace from "@/components/KineticSignalTrace";
import PinnedTelemetryDeck from "@/components/PinnedTelemetryDeck";
import CurtainShutterFooter from "@/components/CurtainShutterFooter";

export default function Home() {
  return (
    <div
      id="top"
      className="relative min-h-screen bg-[#07070a] text-white selection:bg-[#ec4899] selection:text-white"
    >
      {/* Main dark container (z-10) that physically slides upward over the fixed footer (z-0) */}
      <main className="relative z-10 bg-[#07070a] shadow-[0_50px_120px_rgba(0,0,0,0.98)]">
        {/* Background ambient lighting */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 h-[560px] w-[560px] rounded-full bg-[#22d3ee]/10 blur-[160px]" />
          <div className="absolute -top-32 -right-32 h-[560px] w-[560px] rounded-full bg-[#ec4899]/12 blur-[170px]" />
        </div>

        {/* 1. Hero-to-Work Physical Unveil (200vh pinned stage with kinetic typography split,
            portrait scaling/docking to top-left HUD avatar, and phone badges morphing outward) */}
        <HeroPhysicalUnveil />

        {/* 2. Interactive "Signal Trace" SVG Circuit:
            - Wide S-curve SVG path sweeping across 1200x2400 canvas
            - Glowing tip-riding photon orb
            - Scroll-driven depth parallax (Re-Sapori @ 1.2x, Mario Juice @ 0.85x with rotation)
            - Horizontal kinetic typography scrub
            - Velocity-reactive sEMG muscle waveform spiking with fast scroll */}
        <KineticSignalTrace />

        {/* 3. Horizontal "Telemetry" Project Deck (300vh sticky scroll-jacked gallery
            with velocity-driven physical tilt and half-speed parallax watermark) */}
        <PinnedTelemetryDeck />
      </main>

      {/* 4. True Curtain Reveal Footer:
          - Positioned underneath (z-0) so the main dark container slides up like a mechanical shutter
          - Infinite kinetic marquee banner
          - Magnetic cursor-following "AVAILABLE FOR WORK" button */}
      <CurtainShutterFooter />
    </div>
  );
}
